// CHANGED
const userRepository = require('../user/user.repository')
const { hashPassword, compareHashedPassword } = require('../../common/utils/password.util')
const {
    generateAccessToken,
    generateRefreshToken,
    verifyRefreshToken,
    hashRefreshToken,
    generateToken
} = require('../../common/utils/jwt.util');
const AppError = require('../../common/errors/app.error');
const Roles = require('../../common/enums/role.enum')
const { createPasswordResetToken } = require('../../common/utils/reset-token.utils')
const crypto = require("crypto")
const { checkUserUniqueness } = require('../../common/services/business-validation.service');
const { filterObject } = require('../../common/utils/filter-object.util');

module.exports.registerUser = async (userData) => {
    // 1. Check email and phone uniqueness
    await checkUserUniqueness({
        email: userData.email,
        phoneNumber: userData.phoneNumber,
    });
    // 2. Hash password
    const hashedPassword = await hashPassword(userData.password);

    // 3. Create user
    const newUser = {
        ...userData,
        role: userData.role || Roles.PATIENT,
        password: hashedPassword
    }
    const registerNewUser = await userRepository.createNewUser(newUser);

    // 4. Generate tokens
    const accessToken = generateAccessToken({
        id: registerNewUser.id,
        role: registerNewUser.role
    });
    const refreshToken = generateRefreshToken({
        id: registerNewUser.id,
        role: registerNewUser.role
    });

    // 5. Store hashed refresh token
    const hashedRefreshToken = hashRefreshToken(refreshToken);
    await userRepository.updateUser(registerNewUser.id, {
        refreshTokenHash: hashedRefreshToken,
    });

    // 6. Return data
    return {
        registerNewUser,
        accessToken,
        refreshToken,
    };
};


module.exports.loginUser = async (loginUserData) => {
    // 1. Find user
    const user = await userRepository.findUserByEmailWithPassword(loginUserData.email)
    console.log('user:', user);

    // 2. Check user exists
    if (!user) throw new AppError("Invalid email or password", 401);

    // Check user active
    if (!user.isActive) throw new AppError("User account is deactivated", 401);

    // 3. Compare password
    const isPasswordMatched = await compareHashedPassword(loginUserData.password, user.password)

    // 4. Check password
    if (!isPasswordMatched) {
        throw new AppError("Invalid email or password", 401);
    }

    // 5. Generate Access & Refresh Tokens
    const accessToken = generateAccessToken({
        id: user.id,
        role: user.role
    });
    const refreshToken = generateRefreshToken({
        id: user.id,
        role: user.role
    });

    // 6. Hash and store Refresh Token
    const hashedRefreshToken = hashRefreshToken(refreshToken);
    await userRepository.updateUser(user.id, {
        refreshTokenHash: hashedRefreshToken,
        lastLogin: new Date()
    });

    // 7. Remove password
    const { password, ...userWithoutPassword } = user;

    // 8. Return response
    return {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
    };

}


module.exports.getProfile = async (currentUser) => {
    return currentUser;
}

// Refresh Access Token with Token Rotation
module.exports.refreshAccessToken = async (incomingRefreshToken) => {
    if (!incomingRefreshToken) {
        throw new AppError("Refresh token is required", 401);
    }

    let decode;
    try {
        decode = verifyRefreshToken(incomingRefreshToken);
    } catch (err) {
        throw new AppError("Invalid or expired refresh token", 401);
    }

    if (decode.tokenType !== 'refresh') {
        throw new AppError("Invalid token type", 401);
    }

    // Find user including refreshTokenHash
    const user = await userRepository.findUserByIdWithRefreshToken(decode.id);
    if (!user || !user.isActive) {
        throw new AppError("User no longer exists or is deactivated", 401);
    }

    if (!user.refreshTokenHash) {
        throw new AppError("Refresh token has been revoked or user logged out", 401);
    }

    // Compare incoming token hash with stored hash
    const incomingHash = hashRefreshToken(incomingRefreshToken);
    if (incomingHash !== user.refreshTokenHash) {
        throw new AppError("Refresh token mismatch or invalid token", 401);
    }

    // Token Rotation: Generate new Access Token and new Refresh Token
    const newAccessToken = generateAccessToken({
        id: user.id,
        role: user.role
    });
    const newRefreshToken = generateRefreshToken({
        id: user.id,
        role: user.role
    });

    const newHashedRefreshToken = hashRefreshToken(newRefreshToken);
    await userRepository.updateUser(user.id, {
        refreshTokenHash: newHashedRefreshToken,
    });

    return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
    };
};


// CHANGED: Logout functionality
module.exports.logoutUser = async (userId) => {
    if (userId) {
        await userRepository.updateUser(userId, {
            refreshTokenHash: null
        });
    }
    return { message: "Logged out successfully" };
};


module.exports.changePassword = async (currentUser, passwordData) => {
    // find theuser  
    console.log("change password", currentUser)
    const user = await userRepository.findUserByEmailWithPassword(currentUser.email);
    console.log("change password", user)

    // 2. User exists?
    if (!user) {
        throw new AppError("User not found", 404);
    }

    // 3. Compare current password
    const isPasswordMatched = await compareHashedPassword(passwordData.password, user.password)

    // 4. Current password correct?
    if (!isPasswordMatched) {
        throw new AppError("Current password is incorrect", 401);
    }

    // 5. Check confirm password
    if (passwordData.newPassword !== passwordData.confirmPassword) {
        throw new AppError(
            "New password and confirm password do not match",
            400
        );
    }

    // 6. Hash new password
    const hashNewPassword = await hashPassword(passwordData.newPassword);

    // 7. Update password and invalidate refresh token
    await userRepository.updateUser(user.id, {
        password: hashNewPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        passwordChangedAt: new Date(),
        // CHANGED: Invalidate stored refresh token
        refreshTokenHash: null,
    })

    // 8. Success
    return {
        message: "Password changed successfully",
    };

}

// create the resetToken and send back to the user   
module.exports.forgatePassword = async (email) => {
    const user = await userRepository.findUserByEmailWithPassword(email);

    if (!user) return;  //TODO:

    const { resetToken,
        hashedResetToken,
        resetTokenExpires } = createPasswordResetToken();

    //save token 
    await userRepository.updateUser(user.id, {
        passwordResetToken: hashedResetToken,
        passwordResetExpires: resetTokenExpires
    })

    // 5. Create URL
    const resetURL =
        `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    console.log('forgate password reset token', resetURL);
}

module.exports.resetPassword = async (resetToken, passwordData) => {
    // hash token   
    const hashedResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // find USer  
    const user = await userRepository.findUserByResetToken(hashedResetToken);

    // 3. Check token
    if (!user) {
        throw new AppError("Invalid or expired reset token", 400);
    }

    if (passwordData.password !== passwordData.confirmPassword) {
        throw new AppError(
            "Password and confirm password do not match",
            400
        );
    }

    //hash password 
    const hashedPassword = await hashPassword(passwordData.password);

    // 6. Update user and invalidate refresh token
    await userRepository.updateUser(user.id, {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpires: null,
        passwordChangedAt: new Date(),
        // CHANGED: Invalidate stored refresh token
        refreshTokenHash: null,
    });

    // 7. Success
    return {
        message: "Password reset successfully",
    };
}

module.exports.updateProfile = async (userid, userData) => {
    const filterData = filterObject(
        userData,
        "firstName",
        "lastName",
        "phoneNumber")
    const user = await userRepository.findUserById(userid);
    if (!user) throw new AppError("The user is not found", 404);


    const updateUser = await userRepository.updateUser(userid, filterData)

    const { password, ...userWithoutPassword } = updateUser;

    return userWithoutPassword;
}



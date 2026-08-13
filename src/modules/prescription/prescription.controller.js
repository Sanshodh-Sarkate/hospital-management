const  prescriptionService  =  require('./prescription.service')
const asyncHandler  =  require('../../common/utils/async-handler');
const { sendSuccess } = require('../../common/utils/response.util');

module.exports.getPrescriptionById =  asyncHandler(async (req , res , next) => {
    const prescription =  await prescriptionService.getPrescriptionById(req.params.id ,  req.user);
    return sendSuccess(res  ,   200 ,  "prescription" , {prescription});
})


// Create Prescription
module.exports.createPrescription = asyncHandler(async (req , res , next) =>{
    const prescription =
      await prescriptionService.createPrescription(
        req.body,
        req.user
      );

     return sendSuccess(res  , 200 ,  "prescription created successFully!" , {prescription})
   
});


// Get All Prescriptions
module.exports.getPrescriptions =  asyncHandler(async (req , res , next) => {
    const prescriptions =
      await prescriptionService.getPrescriptions(
        req.user
      );

   return sendSuccess(res  , 200 ,  "prescription fetched successFully!" , {prescriptions})
})


// Get My Prescriptions
module.exports.getMyPrescriptions =  asyncHandler(async (req , res , next) => {
  
    const prescriptions =
      await prescriptionService.getMyPrescriptions(
        req.user.id
      );

      return sendSuccess(res  , 200 ,  "prescription fetched successFully!" , {prescriptions})

    
});





// Update Prescription
module.exports.updatePrescription = asyncHandler(async (req , res , next) => { 
    const prescription =
      await prescriptionService.updatePrescription(
        req.params.id,
        req.body,
        req.user
      );

  return sendSuccess(res  , 200 ,  "prescription updated successFully!" , {prescription})
})


// Delete Prescription
module.exports.deletePrescription = asyncHandler(async (req , res , next) => { 
 
    await prescriptionService.deletePrescription(
      req.params.id,
      req.user
    )

    return sendSuccess(res  , 200 ,  "prescription deleted successFully!" )
});

// Update Prescription Item (Medication)
module.exports.updatePrescriptionItem = asyncHandler(async (req, res, next) => {
    const medication = await prescriptionService.updatePrescriptionItem(
        req.params.itemId,
        req.body,
        req.user
    );
    return sendSuccess(res, 200, "Prescription medication updated successfully!", { medication });
});

// Delete Prescription Item (Medication)
module.exports.deletePrescriptionItem = asyncHandler(async (req, res, next) => {
    await prescriptionService.deletePrescriptionItem(
        req.params.itemId,
        req.user
    );
    return sendSuccess(res, 200, "Prescription medication deleted successfully!");
});
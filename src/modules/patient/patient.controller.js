const patientServices  =  require('./patient.service');
const asyncHandler  =  require('../../common/utils/async-handler')

module.exports.registerPatient =  asyncHandler(async (req  , res , next) => {
    const patient  = await patientServices.registerPatient(req.body , req.user.id) ;
     return res.status(201).json({
      success: true,
      message: "Patient created successfully",
      data: patient,
    });
})


module.exports.getAllPatients =  asyncHandler(async (req  , res , next) => {
    const patients  =   await patientServices.getAllPatient();

      return res.status(200).json({
      success: true,
      message: "Patients fetched successfully",
      results: patients.length,
      data: patients,
    });
})

module.exports.getPatientById = asyncHandler(async (req  , res , next) => {
    const patient  =  await patientServices.getPatientById(req.params.id);
       return res.status(200).json({
      success: true,
      message: "Patient fetched successfully",
      data: patient,
    });
})

module.exports.updatePatient = asyncHandler(async (req  , res , next) => {
    const updatedPatient = await patientServices.updatePatient(req.params.id , req.body , req.user.id);
     return res.status(200).json({
      success: true,
      message: "Patient updated successfully",
      data: updatedPatient,
    });
})

module.exports.deletePatient = asyncHandler(async (req  , res , next) => {
    const deletedPatient =  await patientServices.deletePatient(req.params.id , req.user.id )

    return res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
      data: deletedPatient,
    });
})



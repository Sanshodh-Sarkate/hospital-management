const { EntitySchema } = require("typeorm");

const BaseEntity = require("../../common/database/baseEntity");
const MedicalReportType = require(
  "../../common/enums/medical-report-type.enum"
);

module.exports = new EntitySchema({
  name: "MedicalReport",

  tableName: "medical_reports",

  columns: {
    ...BaseEntity,

    // Unique report number
    reportNumber: {
      name: "report_number",
      type: "varchar",
      length: 50,
      unique: true,
      nullable: false,
    },

    // Example: CBC Test, Chest X-Ray, MRI Brain
    reportName: {
      name: "report_name",
      type: "varchar",
      length: 150,
      nullable: false,
    },

    // LAB_TEST, X_RAY, MRI, etc.
    reportType: {
      name: "report_type",
      type: "enum",
      enum: MedicalReportType,
      nullable: false,
    },

    // Doctor's findings / test result
    result: {
      type: "text",
      nullable: false,
    },

    // Optional reference range
    normalRange: {
      name: "normal_range",
      type: "varchar",
      length: 100,
      nullable: true,
    },

    // Example: mg/dL, %, bpm
    unit: {
      type: "varchar",
      length: 50,
      nullable: true,
    },

      reportCharge: {
      name: "report_charge",
      type: "decimal",
      precision: 10,
      scale: 2,
      nullable: false,
      default: 0,
    },


    // Generated PDF report path/URL
    reportFileUrl: {
      name: "report_file_url",
      type: "varchar",
      length: 255,
      nullable: true,
    },

    // Additional comments
    remarks: {
      type: "text",
      nullable: true,
    },

    // When the doctor generated the report
    generatedAt: {
      name: "generated_at",
      type: "timestamp",
      nullable: false,
      default: () => "CURRENT_TIMESTAMP",
    },
  },

  relations: {
    // Many reports belong to one appointment
    appointment: {
      type: "many-to-one",
      target: "Appointment",
      joinColumn: {
        name: "appointment_id",
      },
      nullable: false,
      inverseSide: "medicalReports",
      onDelete: "RESTRICT",
    },

    // Many reports belong to one patient
    patient: {
      type: "many-to-one",
      target: "Patient",
      joinColumn: {
        name: "patient_id",
      },
      nullable: false,
      inverseSide: "medicalReports",
      onDelete: "RESTRICT",
    },

    // Many reports belong to one doctor
    doctor: {
      type: "many-to-one",
      target: "Doctor",
      joinColumn: {
        name: "doctor_id",
      },
      nullable: false,
      inverseSide: "medicalReports",
      onDelete: "RESTRICT",
    },

    // User account of the doctor who generated the report
    generatedBy: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "generated_by",
      },
      nullable: false,
      onDelete: "RESTRICT",
    },
    // User who last updated the report
    updatedBy: {
      type: "many-to-one",
      target: "User",
      joinColumn: {
        name: "updated_by",
      },
      nullable: true,
      onDelete: "SET NULL",
    },
  },
});
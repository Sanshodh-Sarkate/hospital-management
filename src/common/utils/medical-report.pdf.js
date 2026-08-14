const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const generateMedicalReportPdf = (
  medicalReport,
  outputPath
) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      margin: 50,
    });

    const stream = fs.createWriteStream(outputPath);

    doc.pipe(stream);

    // Title
    doc
      .fontSize(20)
      .text("Medical Report", {
        align: "center",
      });

    doc.moveDown();

    // Report Information
    doc
      .fontSize(12)
      .text(`Report Number: ${medicalReport.reportNumber}`);

    doc.text(
      `Report Name: ${medicalReport.reportName}`
    );

    doc.text(
      `Report Type: ${medicalReport.reportType}`
    );

    doc.text(
      `Report Date: ${new Date(
        medicalReport.generatedAt
      ).toLocaleDateString()}`
    );

    doc.moveDown();

    // Patient
    doc
      .fontSize(14)
      .text("Patient Information");

    doc.moveDown(0.5);

    doc
      .fontSize(12)
      .text(
        `Patient ID: ${medicalReport.patient.id}`
      );

    doc.moveDown();

    // Doctor
    doc
      .fontSize(14)
      .text("Doctor Information");

    doc.moveDown(0.5);

    doc
      .fontSize(12)
      .text(
        `Doctor ID: ${medicalReport.doctor.id}`
      );

    doc.moveDown();

    // Result
    doc
      .fontSize(14)
      .text("Result");

    doc.moveDown(0.5);

    doc
      .fontSize(12)
      .text(
        medicalReport.result || "N/A"
      );

    doc.moveDown();

    // Normal Range
    if (medicalReport.normalRange) {
      doc
        .fontSize(14)
        .text("Normal Range");

      doc.moveDown(0.5);

      doc
        .fontSize(12)
        .text(
          medicalReport.normalRange
        );

      doc.moveDown();
    }

    // Unit
    if (medicalReport.unit) {
      doc
        .fontSize(14)
        .text("Unit");

      doc.moveDown(0.5);

      doc
        .fontSize(12)
        .text(
          medicalReport.unit
        );

      doc.moveDown();
    }

    // Remarks
    if (medicalReport.remarks) {
      doc
        .fontSize(14)
        .text("Remarks");

      doc.moveDown(0.5);

      doc
        .fontSize(12)
        .text(
          medicalReport.remarks
        );

      doc.moveDown();
    }

    // Footer
    doc
      .fontSize(9)
      .text(
        "This is a digitally generated medical report.",
        50,
        750,
        {
          align: "center",
        }
      );

    doc.end();

    stream.on("finish", () => {
      resolve(outputPath);
    });

    stream.on("error", reject);
  });
};

module.exports = generateMedicalReportPdf;
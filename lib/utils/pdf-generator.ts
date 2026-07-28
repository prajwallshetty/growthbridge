import { jsPDF } from "jspdf";
import cloudinary from "@/lib/cloudinary";

// Helper: Convert a URL (like the QR code generator API) to a base64 image string for jsPDF
async function getBase64ImageFromUrl(url: string): Promise<string> {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to fetch image from URL: ${url}`);
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");
    const contentType = res.headers.get("content-type") || "image/png";
    return `data:${contentType};base64,${base64}`;
  } catch (error) {
    console.error("Error fetching image for PDF:", error);
    // Return a fallback blank transparent PNG base64
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";
  }
}

// Upload buffer directly to Cloudinary
async function uploadPdfToCloudinary(pdfBuffer: Buffer, fileName: string, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        resource_type: "raw", // Needed for PDF and non-image files in Cloudinary
        public_id: fileName.replace(/\.pdf$/, ""),
        folder: folder,
        format: "pdf",
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary PDF upload error:", error);
          reject(error);
        } else {
          resolve(result!.secure_url);
        }
      }
    ).end(pdfBuffer);
  });
}

interface CertificateData {
  certificateId: string;
  studentName: string;
  domainName: string;
  duration: string;
  issueDate: string;
  projectTitle: string;
  performance: string;
}

export async function generateCertificatePdf(data: CertificateData): Promise<{ pdfUrl: string; qrCodeUrl: string }> {
  // 1. Define Verification URL
  const verifyUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://growthbridge.live"}/internship/verify/${data.certificateId}`;
  
  // 2. Fetch QR Code Base64
  const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(verifyUrl)}`;
  const qrBase64 = await getBase64ImageFromUrl(qrApiUrl);

  // 3. Create jsPDF Doc (A4 Landscape: 842 x 595 px)
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [842, 595],
  });

  // Background cream card (#FCFBF8)
  doc.setFillColor(252, 251, 248);
  doc.rect(0, 0, 842, 595, "F");

  // Elegant gold border line
  doc.setDrawColor(244, 197, 66); // Accent Gold #F4C542
  doc.setLineWidth(3);
  doc.rect(20, 20, 802, 555, "D");

  // Thin outer/inner black frame
  doc.setDrawColor(17, 17, 17); // Dark Charcoal
  doc.setLineWidth(1);
  doc.rect(25, 25, 792, 545, "D");

  // --- Branding Logo Header ---
  doc.setTextColor(17, 17, 17);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(22);
  doc.text("G R O W T H   B R I D G E", 421, 65, { align: "center" });

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(106, 106, 106);
  doc.text("BUILD  .  LAUNCH  .  SCALE", 421, 78, { align: "center" });

  // Divider
  doc.setDrawColor(233, 227, 218); // Border Color #E9E3DA
  doc.setLineWidth(1);
  doc.line(300, 95, 542, 95);

  // --- Title ---
  doc.setTextColor(17, 17, 17);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(28);
  doc.text("CERTIFICATE OF COMPLETION", 421, 140, { align: "center" });

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(106, 106, 106);
  doc.text("This certificate is proudly presented to", 421, 170, { align: "center" });

  // --- Recipient Name ---
  doc.setTextColor(17, 17, 17);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(26);
  doc.text(data.studentName.toUpperCase(), 421, 210, { align: "center" });

  // Underline under name
  doc.setDrawColor(244, 197, 66);
  doc.setLineWidth(2);
  doc.line(250, 220, 592, 220);

  // --- Narrative ---
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(13);
  doc.setTextColor(106, 106, 106);
  
  const line1 = `for successfully completing an internship program in the domain of`;
  const line2 = `${data.domainName} for a duration of ${data.duration}.`;
  doc.text(line1, 421, 255, { align: "center" });
  
  doc.setTextColor(17, 17, 17);
  doc.setFont("Helvetica", "bold");
  doc.text(line2, 421, 275, { align: "center" });

  // Project details & grade
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(106, 106, 106);
  doc.text(`Capstone Project: "${data.projectTitle || "N/A"}"`, 421, 310, { align: "center" });
  doc.text(`Performance Rating: ${data.performance}`, 421, 325, { align: "center" });

  // --- Signatures ---
  // Founder
  doc.setTextColor(17, 17, 17);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Prajwal Shetty", 180, 440, { align: "center" });
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(106, 106, 106);
  doc.text("Founder & CEO", 180, 452, { align: "center" });
  doc.setDrawColor(106, 106, 106);
  doc.setLineWidth(0.5);
  doc.line(100, 425, 260, 425);

  // Program Director
  doc.setTextColor(17, 17, 17);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.text("H. S. Rao", 662, 440, { align: "center" });
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(106, 106, 106);
  doc.text("Program Director", 662, 452, { align: "center" });
  doc.line(582, 425, 742, 425);

  // --- Footer Metadata ---
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(120, 120, 120);
  doc.text(`Certificate ID: ${data.certificateId}`, 100, 515);
  doc.text(`Issue Date: ${data.issueDate}`, 100, 528);

  // --- QR Code ---
  if (qrBase64) {
    try {
      doc.addImage(qrBase64, "PNG", 381, 370, 80, 80);
      doc.setFontSize(7);
      doc.text("Scan to Verify", 421, 460, { align: "center" });
    } catch (e) {
      console.error("Failed to add QR image to PDF:", e);
    }
  }

  // 4. Output PDF Buffer
  const pdfOutput = doc.output("arraybuffer");
  const pdfBuffer = Buffer.from(pdfOutput);

  // 5. Upload to Cloudinary
  const pdfUrl = await uploadPdfToCloudinary(pdfBuffer, `certificate_${data.certificateId}.pdf`, "growthbridge/certificates");

  return {
    pdfUrl,
    qrCodeUrl: qrApiUrl,
  };
}

interface OfferLetterData {
  applicationId: string;
  studentName: string;
  domainName: string;
  duration: string;
  joiningDate: string;
}

export async function generateOfferLetterPdf(data: OfferLetterData): Promise<string> {
  // Create jsPDF Doc (A4 Portrait: 595 x 842 px)
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "px",
    format: [595, 842],
  });

  // Background color (#FCFBF8)
  doc.setFillColor(252, 251, 248);
  doc.rect(0, 0, 595, 842, "F");

  // Elegant gold side accent strip
  doc.setFillColor(244, 197, 66);
  doc.rect(0, 0, 8, 842, "F");

  // Margins: Left 50, Right 50, Top 60
  // --- Header ---
  doc.setTextColor(17, 17, 17);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(18);
  doc.text("GROWTH BRIDGE", 50, 60);

  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(106, 106, 106);
  doc.text("CREATIVE DIGITAL STUDIO  |  MANGALORE, INDIA", 50, 70);

  doc.setDrawColor(233, 227, 218);
  doc.setLineWidth(1);
  doc.line(50, 82, 545, 82);

  // Date
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  doc.setFontSize(10);
  doc.setTextColor(106, 106, 106);
  doc.text(`Date: ${currentDate}`, 50, 105);
  doc.text(`Ref: GB/INT/${data.applicationId}`, 50, 118);

  // Recipient details
  doc.setTextColor(17, 17, 17);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(11);
  doc.text("To,", 50, 150);
  doc.text(data.studentName, 50, 163);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(106, 106, 106);
  doc.text("Selected Candidate", 50, 175);

  // Subject
  doc.setTextColor(17, 17, 17);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(12);
  doc.text(`Subject: Offer of Internship in ${data.domainName}`, 50, 205);

  // Body Text
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(60, 60, 60);

  const text1 = `Dear ${data.studentName},`;
  doc.text(text1, 50, 230);

  const paragraphs = [
    `Following your application and subsequent review process, we are pleased to offer you an internship position as a ${data.domainName} Intern at GrowthBridge. We were highly impressed by your credentials and enthusiasm for building next-generation digital experiences.`,
    
    `The duration of this internship is scheduled for ${data.duration}, commencing on ${data.joiningDate}. During this period, you will be working remotely under the guidance of our engineering leads and program director.`,
    
    `Key Responsibilities & Guidelines:`,
    `1. Complete all assigned weekly tasks with clean, industry-standard code.`,
    `2. Push weekly task updates to your GitHub repository and submit live demo links.`,
    `3. Participate in review meetups and collaborate with team members.`,
    `4. Adhere strictly to the project deadlines and standards of GrowthBridge.`,
    
    `Upon the successful submission and approval of all tasks, you will be awarded an official Internship Certificate from GrowthBridge displaying your capstone project details and performance rating. In addition, outstanding candidates will be considered for performance-based freelance opportunities with our global clients.`,
    
    `Please sign and return a copy of this letter or confirm your acceptance via email within 3 days. We are thrilled to welcome you to the team and build something incredible together!`
  ];

  let currentY = 248;
  const lineSpacing = 14;
  const paragraphSpacing = 12;

  paragraphs.forEach((p, idx) => {
    // If it starts with list numbers, reduce width/indentation or print simply
    const isListItem = p.startsWith("1.") || p.startsWith("2.") || p.startsWith("3.") || p.startsWith("4.");
    const indent = isListItem ? 15 : 0;
    
    doc.setFont(isListItem ? "Helvetica" : "Helvetica", isListItem ? "normal" : "normal");
    const splitLines = doc.splitTextToSize(p, 495 - indent);
    
    splitLines.forEach((line: string) => {
      doc.text(line, 50 + indent, currentY);
      currentY += lineSpacing;
    });

    currentY += paragraphSpacing;
  });

  // Footer / Signature
  currentY += 15;
  doc.setFont("Helvetica", "bold");
  doc.setTextColor(17, 17, 17);
  doc.text("Sincerely,", 50, currentY);
  
  currentY += 25;
  doc.text("Prajwal Shetty", 50, currentY);
  doc.setFont("Helvetica", "normal");
  doc.setTextColor(106, 106, 106);
  currentY += 12;
  doc.text("Founder & CEO", 50, currentY);
  currentY += 10;
  doc.text("GrowthBridge Studio", 50, currentY);

  // Output PDF Buffer
  const pdfOutput = doc.output("arraybuffer");
  const pdfBuffer = Buffer.from(pdfOutput);

  // Upload to Cloudinary
  const pdfUrl = await uploadPdfToCloudinary(pdfBuffer, `offer_${data.applicationId}.pdf`, "growthbridge/offer-letters");

  return pdfUrl;
}

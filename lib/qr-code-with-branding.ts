import QRCode from "qrcode";

interface BrandingSettings {
  foregroundColor?: string;
  backgroundColor?: string;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  margin?: number;
  logoUrl?: string;
  logoSize?: number;
}

export async function generateQRCodeWithBranding(
  data: string,
  branding?: BrandingSettings
): Promise<{ svg: string; png: string }> {
  const options: any = {
    errorCorrectionLevel: branding?.errorCorrectionLevel || "M",
    margin: branding?.margin ?? 1,
    color: {
      dark: branding?.foregroundColor || "#000000",
      light: branding?.backgroundColor || "#FFFFFF",
    },
    width: 300,
  };

  // Generate SVG version with custom colors
  const svg = await QRCode.toString(data, {
    ...options,
    type: "svg",
  });

  // Generate PNG version with custom colors
  const png = await QRCode.toDataURL(data, {
    ...options,
    type: "image/png",
  });

  // Note: Logo embedding would require canvas/server-side image processing
  // For now, we support color customization which is the most important feature
  
  return { svg, png };
}


"use client";
import { QRCodeCanvas } from "qrcode.react";

export default function PermanentQR() {
  const appUrl = "https://qr-checkin-m3km.vercel.app/"; // 🔗 Replace with your deployed link

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#f5f7fa] via-[#e9ecf2] to-[#dce3ef] p-6">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        Permanent QR for Visitor Dashboard
      </h1>
      <div className="bg-white p-6 rounded-2xl shadow-xl">
        <QRCodeCanvas
          value={appUrl}
          size={220}
          level="H"
          includeMargin={true}
        />
      </div>
      <p className="text-gray-600 mt-4">{appUrl}</p>
    </main>
  );
}

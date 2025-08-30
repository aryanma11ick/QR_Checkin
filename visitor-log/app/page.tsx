"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#2A7B9B] to-[#5381ED] text-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="max-w-2xl w-full text-center space-y-8"
      >
        {/* Logo / Title */}
        <h1 className="text-5xl font-extrabold tracking-tight drop-shadow-sm text-white">
          ExploreIT Visitor Log
        </h1>
        <p className="text-lg text-white max-w-lg mx-auto">
          A seamless way to check in at Symbiosis.  
          Enter your details and explore with ease.
        </p>

        {/* Call to Actions */}
        <div className="space-y-4">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/visitor">
              <Button
                size="lg"
                className="px-8 py-6 text-lg rounded-2xl shadow-md bg-gray-700 text-white hover:bg-gray-600 transition"
              >
                Enter as Visitor
              </Button>
            </Link>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link href="/admin/login">
              <Button
                size="lg"
                className="px-8 py-6 text-lg rounded-2xl shadow-md bg-white text-indigo-700 hover:bg-gray-100 transition"
              >
                Admin Login
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.div>
    </main>
  );
}

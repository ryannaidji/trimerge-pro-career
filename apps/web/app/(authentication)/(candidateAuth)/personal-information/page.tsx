"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Page() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/personal-information/step-one");
  }, [router]);
  return  <div style={{
        height: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }}>
        <h1>Redirecting...</h1>
    </div>
    ;
}
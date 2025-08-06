"use client";
import LoadingIndicator from "@/components/LoadingIndicator";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Mid(){
  const {isAdmin} = useAuth();
  const router = useRouter();
  useEffect(()=>{
    if(isAdmin){
      router.push("/admin")
    } else {
      router.push("/dashboard")
    }
  },[])
  return <div>
    <LoadingIndicator />
  </div>
}
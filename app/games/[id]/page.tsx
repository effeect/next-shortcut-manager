"use client";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function GameDetailPage() {
  const { id } = useParams();

  return (
    <>
      <div className="hero">
        <p>Hello</p>
      </div>
    </>
  );
}

"use client"
import React from "react"
export default function CardUI({ children }: { children: React.ReactElement }) {


    return (


        <div className="max-w-full flex justify-center items-center rounded-3xl shadow-lg bg-white p-5">

            {children}

        </div>
    )
}
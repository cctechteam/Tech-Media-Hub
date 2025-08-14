"use client";
{/* Image & Text Display */ }

import { StaticImageData } from "next/image";
import Image from "next/image";
import React from "react";
import { motion } from "framer-motion";

type Alignment = "left" | "right";
type FillType = "object-cover" | "object-contain";

interface ITDProps {
    imageSrc: string | StaticImageData;
    imageBorder?: boolean;
    className?: string;
    alignment: Alignment;
    fillType?: FillType;
    children?: React.ReactNode;
}

export default function ITD({
    imageSrc,
    imageBorder,
    className,
    alignment,
    fillType,
    children,
}: ITDProps) {
    const isLeft = alignment === "left";
    const ft = fillType ?? "object-cover";
    const border = imageBorder ?? true;

    const imageRender = () => (
        <div className="w-full md:w-1/2 flex justify-center items-center p-2">
            <Image
                src={imageSrc}
                alt="ITD Image"
                className={`${ft} max-h-full max-w-auto ${border ? "border-2 border-gray-500" : ""
                    } rounded-2xl`}
            />
        </div>
    );

    return (
        <motion.div
            className={`${className} flex flex-col md:flex-row w-full`}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
        >
            {isLeft && imageRender()}

            <div className="w-full md:w-1/2 flex flex-col p-4">{children}</div>

            {!isLeft && imageRender()}
        </motion.div>
    );
}
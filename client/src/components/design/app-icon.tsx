"use client"

import iconWhite from "@/assets/only_logo.png";
import {ComponentProps, useEffect, useState} from "react";
import {useTheme} from "@/providers/theme-provider.tsx";

const iconColor = iconWhite;

export default function AppIcon(props: Readonly<Omit<ComponentProps<"img">, "src" | "alt">>) {
  const {resolvedTheme} = useTheme();
  const [src, setSrc] = useState(iconWhite);
  
  useEffect(() => {
    setSrc(resolvedTheme === "dark" ? iconWhite : iconColor);
  }, [resolvedTheme]);
  
  return (
    <img
      {...props}
      src={src}
      alt="App Icon"
    />
  )
}
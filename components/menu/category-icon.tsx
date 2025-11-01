"use client";

import React from "react";
import * as Icons from "react-icons/fa";
import * as Fa6Icons from "react-icons/fa6";
import * as MdIcons from "react-icons/md";
import * as HiIcons from "react-icons/hi";
import * as FiIcons from "react-icons/fi";

const iconLibraries: Record<string, any> = {
  fa: Icons,
  fa6: Fa6Icons,
  md: MdIcons,
  hi: HiIcons,
  fi: FiIcons,
};

interface CategoryIconProps {
  iconPath?: string | null;
  className?: string;
  size?: number;
}

export function CategoryIcon({ iconPath, className = "", size = 20, style, ...props }: CategoryIconProps & React.HTMLAttributes<HTMLElement>) {
  if (!iconPath) return null;

  // Handle Font Awesome 6 icons (FaUtensils, etc.)
  if (iconPath.startsWith('Fa') && Fa6Icons[iconPath as keyof typeof Fa6Icons]) {
    const Icon = Fa6Icons[iconPath as keyof typeof Fa6Icons] as React.ComponentType<any>;
    return <Icon className={className} size={size} style={style} {...props} />;
  }

  const [prefix, iconName] = iconPath.includes(":")
    ? iconPath.split(":")
    : ["fa", iconPath]; // Default to FontAwesome if no prefix

  const IconLib = iconLibraries[prefix];
  if (!IconLib || !IconLib[iconName]) {
    // Fallback to FontAwesome 6
    if (Fa6Icons[iconName as keyof typeof Fa6Icons]) {
      const Icon = Fa6Icons[iconName as keyof typeof Fa6Icons] as React.ComponentType<any>;
      return <Icon className={className} size={size} style={style} {...props} />;
    }
    return null;
  }

  const Icon = IconLib[iconName] as React.ComponentType<any>;
  return <Icon className={className} size={size} style={style} {...props} />;
}


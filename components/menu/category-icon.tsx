"use client";

import React from "react";
import * as Icons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as HiIcons from "react-icons/hi";
import * as FiIcons from "react-icons/fi";

const iconLibraries: Record<string, any> = {
  fa: Icons,
  md: MdIcons,
  hi: HiIcons,
  fi: FiIcons,
};

interface CategoryIconProps {
  iconPath?: string | null;
  className?: string;
  size?: number;
}

export function CategoryIcon({ iconPath, className = "", size = 20 }: CategoryIconProps) {
  if (!iconPath) return null;

  const [prefix, iconName] = iconPath.includes(":") 
    ? iconPath.split(":") 
    : ["fa", iconPath]; // Default to FontAwesome if no prefix

  const IconLib = iconLibraries[prefix];
  if (!IconLib || !IconLib[iconName]) return null;

  const Icon = IconLib[iconName] as React.ComponentType<any>;
  return <Icon className={className} size={size} />;
}


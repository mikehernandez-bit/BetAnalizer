import * as React from "react";

interface LogoIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

/**
 * BetAnalyzer mark: an ascending stat trend that resolves into a ball,
 * doubling as the app favicon (see app/icon.svg, kept visually in sync).
 */
export function LogoIcon({ size = 32, className, ...props }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      <rect width="40" height="40" rx="10" fill="#0D131B" />
      <rect
        x="0.5"
        y="0.5"
        width="39"
        height="39"
        rx="9.5"
        stroke="#22C55E"
        strokeOpacity="0.25"
      />
      <path
        d="M7 27L15 19.5L20.5 24.5L33 11"
        stroke="#22C55E"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M25.5 11H33V18.5"
        stroke="#39FF88"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="33" cy="11" r="4.5" fill="#39FF88" />
      <path
        d="M33 7.3L34.3 9.6H31.7L33 7.3Z"
        fill="#0D131B"
      />
      <path
        d="M30.2 12.3L32 11.2L33 12.3L32.4 14.2L31 14.6L30.2 12.3Z"
        fill="#0D131B"
      />
      <path
        d="M35.8 12.3L34 11.2L33 12.3L33.6 14.2L35 14.6L35.8 12.3Z"
        fill="#0D131B"
      />
    </svg>
  );
}

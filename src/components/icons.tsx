import type { SVGProps } from "react";

export function IndiFarmIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M12 2a10 10 0 0 0-10 10c0 3.33 1.67 6.33 4.17 8.17" />
      <path d="M12 22a10 10 0 0 0 10-10c0-3.33-1.67-6.33-4.17-8.17" />
      <path d="M12 2a10 10 0 0 1 4.17 8.17A10 10 0 0 1 12 22" />
      <path d="M12 2a10 10 0 0 0-4.17 8.17A10 10 0 0 0 12 22" />
      <path d="M2 12h20" />
      <path d="M16.83 5.83a4 4 0 0 1-5.66 5.66" />
      <path d="M7.17 18.17a4 4 0 0 1 5.66-5.66" />
    </svg>
  );
}

import Image from "next/image";

export default function Logo() {
  return (
    <Image
      src="/logo-southern.jpeg"
      width={30}
      height={30}
      className="me-1 rounded-[5px] transition-all group-data-collapsible:size-7 group-data-[collapsible=icon]:size-8"
      alt="Southern Apparels and Holdings logo"
      unoptimized
    />
  );
}

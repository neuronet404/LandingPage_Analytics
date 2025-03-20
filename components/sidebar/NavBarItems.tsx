import React from "react";
import Image from "next/image";
import Link from "next/link";
import { navItems } from "@/constants";

const NavBarItems = () => {
  return (
    <div className="flex items-center w-full h-full">
      <ul className="flex flex-col gap-2">
        {navItems.map(({ url, name, icon }) => (
          <li key={name} className="group flex items-center gap-3 p-2 rounded-lg hover:bg-violet-300 transition">
            <Link href={url} className="flex items-center gap-3">
              <Image src={icon} alt={name} width={30} height={30} className="" />
              <p className="opacity-0 font-semibold translate-x-2 dark:text-black group-hover:opacity-100 group-hover:translate-x-0 transition duration-300">
                {name}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default NavBarItems;

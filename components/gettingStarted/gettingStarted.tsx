import Image from "next/image";
import handHi from "../../public/handHi.svg"

export default function GettingStarted() {
    return (
        <div className="flex justify-center items-center bg-white p-4 w-[57rem] h-[27rem] mx-auto gap-4">
            <div className="text-left space-y-10">
                <h1 className="text-6xl font-semibold text-[#412B7D]">GET STARTED</h1>
                <p className="text-[#412B7D] mt-2 ml-2 text-3xl">
                    With <span className="text-green-600 font-medium bg-gradient-to-r text-transparent from-[#553C9A] to-[#047857] bg-clip-text ">Acolyte</span>
                </p>
            </div>
            <div className="ml-4 animate-waving-hand w-32 h-32 mt-3">
                <Image

                    src={handHi}
                    height={1500}
                    width={1500}
                    alt="waving hand"
                />
            </div>
        </div>


    )
}
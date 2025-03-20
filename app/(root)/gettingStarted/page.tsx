import CardUI from "@/components/gettingStarted/cardUI";
import LogoSlide from "@/components/gettingStarted/logoSlide";



// page - Getting started
const Page = () => {
    return (
        <div className="font-rubik h-screen w-full flex ">
            {/* Main content area - scrollable with hidden scrollbar */}
            <div className="flex-1 h-full overflow-y-auto no-scrollbar bg-[#EEF1F5]">
                <div className="h-full max-w-full p-4 space-y-12 flex justify-center items-center">
                    <CardUI>
                        <LogoSlide />
                    </CardUI>
                </div>
            </div>
        </div>
    );
};

export default Page;
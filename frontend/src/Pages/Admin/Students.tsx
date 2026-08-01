import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminStudents() {
    return (
        <div className="w-full h-full ">
            <div className="w-full h-[10%] px-2 flex justify-between">
                <p className="font-bold text-xl">Students</p>
                <form className="w-[40%] h-full flex gap-4">
                    <Input />
                    <Button>search</Button>
                </form>
            </div>

            <div className="w-full h-[97%] pb-10 overflow-hidden overflow-y-scroll grid grid-cols-4 gap-5 ">
                <div className="border-2 h-fit rounded-lg p-3 flex flex-col items-center gap-3">
                    <p className="text-center font-bold text-lg truncate">Bharani Rayudu</p>
                    <div className="rounded-full bg-muted w-[6rem] h-[6rem]">
                        <img className="w-full h-full rounded-full" src="https://assets.leetcode.com/static_assets/public/webpack_bundles/images/LeetCode_new_logo_light.0f4d45e9c.svg" alt="" />
                    </div>
                    <p className="font-semibold text-primary/70 mt-3">Team - 5</p>
                    <Button className="w-full ">View Profile</Button>
                </div>                
            </div>
        </div>
    )
}
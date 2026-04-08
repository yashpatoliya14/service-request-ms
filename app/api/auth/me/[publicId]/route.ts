import { NextRequest, NextResponse } from "next/server";
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
});

export async function DELETE(req:NextRequest,{params}: {params: {publicId: string}}) {
    const { publicId } = await params;
    
    try{
        const result = await cloudinary.uploader.destroy(publicId);
        
        return NextResponse.json({
            success: true,
            message: "Profile photo deleted successfully",
            data: result
        }, { status: 200 });
    }catch(e:any){
        return NextResponse.json({
            success: false,
            message: e.message,
            data: []
        }, { status: 500 });
    }
}
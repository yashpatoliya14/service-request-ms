import { apiClient } from "@/lib/apiClient";

export const uploadProfilePhoto = async (file: File,publicId?:string) => {

  if(publicId){
    try{

      const res = await apiClient.delete("/api/auth/me/"+publicId)
      console.log(res);
    }catch(e){
      console.error(e);
    }
    
  }
    const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "srms_profile_images");

  try {
    const res = await fetch("https://api.cloudinary.com/v1_1/" + process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME + "/image/upload",{
        method: "POST",
        // headers:{
        //     api_key:process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY!,
        // },
        body: formData
    })


    return (await res.json()).secure_url;
  } catch (err) {
    console.error(err);
  }   
}


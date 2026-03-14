import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

//types

interface IPersonMappingBody {
    ServiceRequestTypeID: string;
    ServiceDeptPerson: string;
}

interface IPersonMappingResponse {
    success: boolean;
    message: string;
    data: any[];
}


// Create Person mapping  
export async function POST(req: NextRequest) {
    try {

        const body = await req.json();
        const { ServiceRequestTypeID, DeptPersonID } = body;

        // Check if mapping already exists for this Request Type
        const existingMapping = await prisma.serviceRequestTypeWisePerson.findFirst({
            where: {
                ServiceRequestTypeID: Number(ServiceRequestTypeID)
            }
        });

        if (existingMapping) {
            return NextResponse.json(
                { success: false, message: "A mapping for this request type already exists", data: [] },
                { status: 400 }
            );
        }

        //create
        const personMapping = await prisma.serviceRequestTypeWisePerson.create({
            data: {
                ServiceRequestTypeID: Number(ServiceRequestTypeID),
                ServicePersonID: Number(DeptPersonID),

            }
        })
        if (personMapping) {
            return NextResponse.json({ success: true, message: "Person Mapping Created Successfull", data: [personMapping] } as IPersonMappingResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Person Mapping Creation Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in creating person mapping ${e}`);
        return NextResponse.json({ success: false, message: "Person Mapping Creation Failed", data: [] }, { status: 500 });
    }
}

// get all Person mapping
export async function GET(req: NextRequest) {
    try {

        //get the Person mapping Data
        const personMapping = await prisma.serviceRequestTypeWisePerson.findMany({
            select: {
                ServiceRequestTypeID: true,
                ServicePersonID: true,

                ServiceRequestType: {
                    select: {
                        RequestTypeName: true,
                    },
                },

                ServiceDeptPerson: {
                    select: {
                        Users: {
                            select: {
                                FullName: true,
                                Email: true,
                                Phone: true,
                                Role: true,
                            },
                        },
                        ServiceDepartment:{
                            select:{
                                DeptName:true,
                            }
                        }
                    },
                },
            },
        });

        if (personMapping) {
            return NextResponse.json({ success: true, message: "Get All Person Mapping Successfull", data: personMapping ? personMapping : [] } as IPersonMappingResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Get All Person Mapping Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in getting all person mapping ${e}`);
        return NextResponse.json({ success: false, message: "Get All Person Mapping Failed", data: [] }, { status: 500 });
    }
}

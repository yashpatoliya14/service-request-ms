import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Update Person mapping
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { ServiceRequestTypeID, ServicePersonID } = body;

        // Find the record using ServiceRequestTypeID (since frontend uses it as id)
        const existingRecord = await prisma.serviceRequestTypeWisePerson.findFirst({
            where: {
                ServiceRequestTypeID: Number(id)
            }
        });

        if (!existingRecord) {
            return NextResponse.json({ success: false, message: "Person mapping not found", data: [] }, { status: 404 });
        }

        const personMapping = await prisma.serviceRequestTypeWisePerson.update({
            where: {
                ServiceRequestTypeWisePerson: existingRecord.ServiceRequestTypeWisePerson
            },
            data: {
                ServiceRequestTypeID: Number(ServiceRequestTypeID),
                ServicePersonID: Number(ServicePersonID),
                ModifiedAt: new Date(),
            }
        });

        if (personMapping) {
            return NextResponse.json({ success: true, message: "Person Mapping Updated Successfully", data: [personMapping] }, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Person Mapping Update Failed", data: [] }, { status: 400 });
        }
    } catch (e) {
        console.log(`Error in updating person mapping ${e}`);
        return NextResponse.json({ success: false, message: "Person Mapping Update Failed", data: [] }, { status: 500 });
    }
}

// Delete Person mapping
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        // Find the record using ServiceRequestTypeID (since frontend uses it as id)
        const existingRecord = await prisma.serviceRequestTypeWisePerson.findFirst({
            where: {
                ServiceRequestTypeID: Number(id)
            }
        });

        if (!existingRecord) {
            return NextResponse.json({ success: false, message: "Person mapping not found", data: [] }, { status: 404 });
        }

        const personMapping = await prisma.serviceRequestTypeWisePerson.delete({
            where: {
                ServiceRequestTypeWisePerson: existingRecord.ServiceRequestTypeWisePerson
            }
        });

        if (personMapping) {
            return NextResponse.json({ success: true, message: "Person Mapping Deleted Successfully", data: [personMapping] }, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Person Mapping Deletion Failed", data: [] }, { status: 400 });
        }
    } catch (e) {
        console.log(`Error in deleting person mapping ${e}`);
        return NextResponse.json({ success: false, message: "Person Mapping Deletion Failed", data: [] }, { status: 500 });
    }
}

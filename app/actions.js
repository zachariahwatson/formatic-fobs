'use server'

import { prisma } from './utils/prisma'
import { spawn } from 'child_process'
import { revalidatePath } from 'next/cache'
const fs = require('fs')
import { useRouter } from 'next/navigation'

export async function handleTwitterSubmit(formData) {
    //create user entry
    const user = await prisma.user.create({
        data: {
            ContactInfo: formData.get('twitterAccount')
        }
    })

    //create model entry
    const model = await prisma.model.create({
        data: {
            UserID: user.ID,
        }
    })

    console.log(user)
    console.log(model)
}

export async function saveToOutputs(fileContents, modelParams) {
    //creates .stl file of model in the outputs folder

    //query to find the latest model created that is also the current model
    const searchResults = await prisma.model.findMany({
        where: { 
            IsCurrentModel: true      
        },     
        orderBy: {
            TimeStamp: 'desc'
        },
        take: 1
    })
    let model = searchResults[0]

    //attach model to print job
    const printJobs = await prisma.print.findMany({
        where: {
            Status: 'filling'
        },
        orderBy: {
            TimeStamp: 'asc'
        },
        take: 1
    })
    let printJob = printJobs.length == 0 ? 
        await prisma.print.create({
            data: {
                Status: 'filling',
            }
        }) : printJobs[0]

    //update specified model's STL path and add print job ID
    model = await prisma.model.update({
        where: { ID: model.ID },
        data: {
            Params: modelParams,
            STLPath: `${process.env.OUTPUTS_PATH}${model.ID}.stl`,
            IsCurrentModel: false,
            Print: {
                connect: {
                    ID: printJob.ID
                }
            }
        },
    })

    //add model ID to print job
    printJob = await prisma.print.update({
        where: { ID: printJob.ID },
        data: {
            ModelIDs: {
                push: model.ID
            }
        },
    })

    //check to see if print job is full (4 models) and set to full if it is
    if (printJob.ModelIDs.length >= 4) {
        printJob = await prisma.print.update({
            where: { ID: printJob.ID },
            data: {
                Status: 'full'
            },
        })
    }

    console.log(printJob)
    console.log(model)

    //create .stl file
    fs.writeFile(process.env.OUTPUTS_PATH + `${model.ID}.stl`, fileContents, (err) => {
        if (err) {
            console.error('error creating file:', err)
        } else {
            console.log('file created successfully.')
        }
    })
}

export async function clearDB() {
    await prisma.model.deleteMany({})
    await prisma.user.deleteMany({})
    await prisma.print.deleteMany({})

    // console.log(await prisma.model.findMany({}))
    // console.log(await prisma.user.findMany({}))
    // console.log(await prisma.print.findMany({}))
    
}

export async function slice(meshIDs) {
    //will be different for mac
    const command = process.env.PRUSA_CLI_PATH
    const args = [
        `--export-gcode`, 
        `--merge`,
        `--load`, `./../cfg/test1.ini`,
        `--load`, `./../cfg/test2.ini`, 
        `--load`, `./../cfg/test3.ini`,
    ]

    meshIDs.forEach((meshID) => {
        args.push(`${meshID}.stl`)
    })

    //programatically add these later
    // const args = [
    //     `--export-gcode`, 
    //     `--merge`,
    //     `--load`, `./../cfg/test1.ini`,
    //     `--load`, `./../cfg/test2.ini`, 
    //     `--load`, `./../cfg/test3.ini`, 
    //     `cube1.stl`, `cube2.stl`, `cube3.stl`, 
    // ]
    //const args = ['--help-fff']

    //spawn child process
    const childProcess = spawn(command, args, { 
        stdio: 'inherit', //inherit server cmd window
        cwd: process.env.OUTPUTS_PATH , //cd to outputs folder
    })

    childProcess.on('error', (err) => {
        console.error(`failed to start child process: ${err}`)
    })

    childProcess.on('close', (code) => {
    if (code === 0) {
        console.log('child process exited successfully')
    } else {
        console.error(`child process exited with code ${code}`)
    }
    })
}
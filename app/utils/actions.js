'use server'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import { spawn } from 'child_process'
import { revalidatePath } from 'next/cache'
const fs = require('fs')

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

export async function SaveToOutputs(fileContents) {
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
    const model = searchResults[0]

    //update specified model's STL path
    const updatedModel = await prisma.model.update({
        where: { ID: model.ID },
        data: {
          STLPath: `${process.env.OUTPUTS_PATH}${model.ID}.stl`,
          IsCurrentModel: false
        },
    })

    console.log(updatedModel)

    //create .stl file
    fs.writeFile(process.env.OUTPUTS_PATH + `${updatedModel.ID}.stl`, fileContents, (err) => {
        console.log('wat')
        if (err) {
            console.error('error creating file:', err)
        } else {
            console.log('file created successfully.')
        }
    })
}

export async function Slice(meshIDs) {
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
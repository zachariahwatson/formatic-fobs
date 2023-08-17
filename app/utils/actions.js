'use server'

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import { spawn } from 'child_process'
import { revalidatePath } from 'next/cache'
const fs = require('fs')
import { cookies } from 'next/headers'

export async function handleTwitterSubmit(formData) {
    cookies.delete('twitterAccount')
    cookies.set('twitterAccount', formData.get('twitterAccount'))
    cookies.set('ShowModelScene', true)
    revalidatePath('/')
}

export async function SaveToOutputs(userContactInfo, fileContents) {
    //creates .stl file of model in the outputs folder

    //create user entry
    const user = await prisma.user.create({
        data: {
            ContactInfo: userContactInfo
        }
    })
    console.log(user)

    //console.log('saving...')

    //create model entry
    const model = await prisma.model.create({
        data: {
            UserID: user.ID,
            Type: 'cube',
            Params: {params: 'test'},
        }
    })
    console.log(model)
    //after creating, create path for the STL (gotta do it like this because there's no way to access the model id while creating the entry)
    prisma.model.update({
        where: { id: model.ID },
        data: {
          STLPath: `${process.env.OUTPUTS_PATH}${model.ID}.stl`,
        },
    })

    fs.writeFile(process.env.OUTPUTS_PATH + `${model.ID}.stl`, fileContents, (err) => {
        if (err) {
            console.error('error creating file:', err)
        } else {
            console.log('file created successfully.')
        }
    })

    cookies.set('setModelScene', false)
    revalidatePath('/')
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
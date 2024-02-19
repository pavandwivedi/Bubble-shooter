import versionModel from "../models/Version.js";
import {error,success} from "../utills/responseWrapper.utill.js";

export async function insertVersionController(req, res) {
    console.log("pavan");
    const { version } = req.body;
    try {
        let existingVersion = await versionModel.findOne({ version });
        if (existingVersion) {
            // If the version already exists, update it instead of creating a new one
            existingVersion = await versionModel.findOneAndUpdate({ version }, { version }, { new: true });
            console.log(existingVersion);
            return res.send(success(200, "Version updated successfully"));
        }

        // If the version doesn't exist, create a new one
        const newVersion = await versionModel.create({ version });
        console.log(newVersion);
        return res.send(success(200, "New version created"));
    } catch (err) {
        return res.send(error(500, err.message));
    }
}


export async function getVersionController(req,res){
    try {
        const existingVersion = await  versionModel.find();
       const getVersion = existingVersion[0];
        return res.send(success(200,getVersion.version ));
    } catch (err) {
        return res.send(error(500,err.message));
    }
}

const uploadFile = require("../middleware/upload");
const { exec } = require('child_process');
const fs = require("fs");
const baseUrl = "http://localhost:8080/files/";
const https = require('https'); 
const axios = require('axios'); 
const { stdout, stderr } = require("process");
const upload = async (req, res) => {
  try {
    await uploadFile(req, res);

    if (req.file == undefined) {
      return res.status(400).send({ message: "Please upload a file!" });
    }

    res.status(200).send({
      message: "Uploaded the file successfully: " + req.file.originalname,
    });
  } catch (err) {
    console.log(err);

    if (err.code == "LIMIT_FILE_SIZE") {
      return res.status(500).send({
        message: "File size cannot be larger than 2MB!",
      });
    }

    res.status(500).send({
      message: `Could not upload the file: ${req.file.originalname}. ${err}`,
    });
  }
};

const getListFiles = (req, res) => {
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      res.status(500).send({
        message: "Unable to scan files!",
      });
    }

    let fileInfos = [];

    files.forEach((file) => {
      fileInfos.push({
        name: file,
        url: baseUrl + file,
      });
    });

    res.status(200).send(fileInfos);
  });
};

const download = (req, res) => {

  const fileName = req.params.name;
  const directoryPath = __basedir + "/resources/static/assets/uploads/";

  res.download(directoryPath + fileName, fileName, (err) => {
    if (err) {
      res.status(500).send({
        message: "Could not download the file. " + err,
      });
    }
  });
};
const installApk = function(finishedWrite,file,directoryPath,res){
  finishedWrite.on('finish',function(){
    exec(`unzip ${file.path} -d ${directoryPath}`,catchAdbInstallErrors)  
    const newApkPath = `${directoryPath}/app-debug.apk`
    exec(`adb install ${newApkPath}`,catchAdbInstallErrors)
    console.log("--------------------------------------------------------------------------------")

  })
  let stdeerAll = ''
  function catchAdbInstallErrors(err,stdout,stderr){
    if (err) {
      //some err occurred
      console.error(err)
      //res.send(err)
    } else {
     // the *entire* stdout and stderr (buffered)
     console.log(`stdout: ${stdout}`);
     console.log(`stderr: ${stderr}`);
     stdeerAll+=stderr
     //res.send(`stderr: ${stderr}`)
    }
  } 
 
    res.send(`stderr: ${stdeerAll}`)
}
const downloadGithubArt = async(req, res) => {
 
  const ghaBaseUrl = "api.github.com"
  const repo = "/repos/ecrseer/liner-routiner-androidkotlin/actions/artifacts"
 
  const userChroWin =  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.51 Safari/537.36"

  const workflwtoken = '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'
   
  const htp = "https://"
  const getArtifactArchiveUrlOptionsAx = {
    url: htp+ghaBaseUrl+repo,  
    method:'get',
    headers: {
      'User-Agent': userChroWin,
      'Authorization': 'token '+workflwtoken
    }
  }

  console.log("--------------------------------------------------------------------------------") 
  const {data} = await axios(getArtifactArchiveUrlOptionsAx).catch(er=>{
    res.send(er)
  })

  const first = data.artifacts[0]
  const archiveUrlOptions = {...getArtifactArchiveUrlOptionsAx}
  archiveUrlOptions.url = first.archive_download_url
  archiveUrlOptions.responseType = 'stream'
  const downloadArtStream = await axios(archiveUrlOptions).catch(er=>{
    res.send(er)
  })

  const directoryPath = __basedir + "/resources/"
  const file = fs.createWriteStream(directoryPath+"apepe.zip");
  
  const finishedWrite = downloadArtStream.data.pipe(file)
  
  installApk(finishedWrite,file,directoryPath,res)

};
module.exports = {
  upload,
  getListFiles,
  download,
  downloadGithubArt
};

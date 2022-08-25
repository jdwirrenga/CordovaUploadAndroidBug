import { Injectable } from '@angular/core';
import { FileTransferManager, FTMOptions, FTMPayloadOptions, UploadEvent } from '@awesome-cordova-plugins/background-upload';
import { FileEntry } from '@awesome-cordova-plugins/file';
import { DirectoryEntry, Entry, File } from '@awesome-cordova-plugins/file/ngx';
import { Platform } from '@ionic/angular';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  uploader: FileTransferManager

  constructor(private file: File, private platform: Platform) { 
    this.handleVideoUpload = this.handleVideoUpload.bind(this)

    if(this.platform.is("mobile") && !this.platform.is("mobileweb")) {
			var config: FTMOptions = {
				callBack: this.handleVideoUpload
			};
	
			this.uploader = new FileTransferManager(config)
		}
  }

  uploadVideo(videoFilePath: string): void {
    console.log("Uploading video...")

    let fileSplitIndex = videoFilePath.lastIndexOf('/')
    let filePath = videoFilePath.substring(0, fileSplitIndex)
    let fileName = videoFilePath.substring(fileSplitIndex + 1)

    this.file.resolveDirectoryUrl(filePath).then((dirEntry: DirectoryEntry) => {
      this.file.getFile(dirEntry, fileName, {}).then((fileEntry: FileEntry) => {
        console.log("Get file stuff:")
        console.log(fileEntry.fullPath)
        console.log(fileEntry.nativeURL)
        console.log(fileEntry.toInternalURL())
        console.log(fileEntry.toURL())
        this.backgroundUploadFile('/Profile/UploadVideo', '1', fileEntry.nativeURL, "file").subscribe()
      })
    })

    this.file.moveFile(filePath, fileName, this.file.dataDirectory, fileName).then((output: Entry) => {
      console.log("Move file stuff:")
      console.log(output.fullPath)
      console.log(output.nativeURL)
      console.log(output.toInternalURL())
      console.log(output.toURL())
      this.backgroundUploadFile('/Profile/UploadVideo', '1', output.nativeURL, "file").subscribe()
    })
  }

  backgroundUploadFile(endpoint: string, id: string, filePath: string, fileKey: string): Observable<any> {
		let url: string = "somewhere"
		console.log(`RestService upload sending Upload to ${url} with file ${filePath}`);
		let headers: { [name: string]: string } = {
			'enctype': 'multipart/form-data'
		};

    let payload: FTMPayloadOptions = {
      id: id,
      filePath: filePath,
      fileKey: fileKey,
      serverUrl: 'http://192.168.1.192:45455/Profile/UploadVideo',
      notificationTitle: "UploadVideoComplete",
      headers: headers,
    }

    return of(this.uploader.startUpload(payload))
	}

  private handleVideoUpload(event: UploadEvent) {
		if(event.state === "UPLOADING" && event.progress != null) {
			console.log(`id: ${event.id}, progress: ${event.progress}`)
		}

		if(event.state === "UPLOADED") {
			console.log("UPLOADED")
			this.uploader.acknowledgeEvent(event.eventId)
		}
	}
}

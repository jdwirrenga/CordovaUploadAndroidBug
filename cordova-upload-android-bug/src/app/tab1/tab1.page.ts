import { Component } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Capacitor } from '@capacitor/core';
import { Camera as NativeCamera } from '@ionic-native/camera/ngx';
import { Video } from '../models/video';
import { VideoService } from '../services/video.service';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  video: Video

  constructor(
    private domSanitizer: DomSanitizer,
    private nativeCamera: NativeCamera,
    private videoService: VideoService
  ) {}

  async uploadVideo(): Promise<void> {
    this.nativeCamera.getPicture({
      quality: 100,
      destinationType: this.nativeCamera.DestinationType.FILE_URI,
      mediaType: this.nativeCamera.MediaType.VIDEO,
      sourceType: this.nativeCamera.PictureSourceType.PHOTOLIBRARY
    }).then(uri => {
      if(uri.indexOf("file://") < 0) {
        uri = "file://" + uri
      }

      this.video = {
        filePath: uri,
        safeUrl: this.getSanitizedUrl(Capacitor.convertFileSrc(uri))
      }
    })   
  }

  submit(): void {
    this.videoService.uploadVideo(this.video.filePath)
  }

  getSanitizedUrl(url: string): SafeUrl {
    return this.domSanitizer.bypassSecurityTrustUrl(url)
  }
}
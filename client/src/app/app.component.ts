import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpEventType } from '@angular/common/http';
import { 
  MatSnackBar, 
  MatSnackBarConfig ,
  MatSnackBarVerticalPosition, 
  MatSnackBarHorizontalPosition
} from '@angular/material';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})

export class AppComponent implements OnInit {
  selectedFile;
  uploadPercent;
  color = 'primary';
  mode = 'determinate';
  selectedFiles = [];
  verticalPosition: MatSnackBarVerticalPosition = 'top';
  horizontalPosition: MatSnackBarHorizontalPosition = 'center';
  snackBarConfig: MatSnackBarConfig = {
    duration: 5000,
    panelClass: 'blue-snackbar',
    verticalPosition: this.verticalPosition,
    horizontalPosition: this.horizontalPosition
  };

  constructor(
    private http: HttpClient,
    public snackBar: MatSnackBar,
  ) {}

  ngOnInit() {}

  dragOverHandler(event) {
    console.log('files in drop zone');
    event.preventDefault();
    event.stopPropagation();
  }

  dropHandler(event) {

    console.log(event.dataTransfer.items.length);
    
    if (event.dataTransfer.items) {
      for (let i = 0; i < event.dataTransfer.items.length; i++) {
        if (event.dataTransfer.items[i].kind === 'file') {
          let file = event.dataTransfer.items[i].getAsFile();
          let obj = {
            fileName: file.name,
            selectedFile: file,
            fileId: `${file.name}-${file.lastModified}`,
            uploadCompleted: false
          }

          this.selectedFiles.push(obj);
          console.log(this.selectedFiles);
          
          console.log('...file[' + i + '].name = ' + file.name);
        }
      }

      this.selectedFiles.forEach(file => this.getFileUploadStatus(file));
    } else {
      for (let i = 0; i < event.dataTransfer.files.length; i++) {
        console.log('====================================');
        console.log('...file[' + i + '].name = ' + event.dataTransfer.files.name);
        console.log('====================================');
      }
    }

    event.preventDefault();
  }

  onFileSelect(event) {
    if (event.target.files) {
      for (let i = 0; i < event.target.files.length; i++) {
        let file = event.target.files[i];        
        let obj = {
          fileName: file.name,
          selectedFile: file,
          fileId: `${file.name}-${file.lastModified}`,
          uploadCompleted: false
        }

        this.selectedFiles.push(obj);
        console.log(this.selectedFiles);
        
        console.log('...file[' + i + '].name = ' + file.name);

      }

      this.selectedFiles.forEach(file => this.getFileUploadStatus(file));
    }
  }

  uploadFiles() {
    if (this.selectedFiles.length === 0) {
      this.snackBar.open('No File Selected', 'close', this.snackBarConfig);
    }

    if (this.selectedFiles.length <= 5) {
      this.selectedFiles.forEach(file => {
        if (file.uploadPercent < 100) {
          this.resumeUpload(file);
        }
      });
    } else {
      console.log('max 5 limit');
      this.snackBar.open('Maximum 5 Files Are Allowed', 'close', this.snackBarConfig);
    }
    
  }

  getFileUploadStatus(file) {
    let headers = new HttpHeaders({
      'size': file.selectedFile.size.toString(),
      'x-file-id': file.fileId,
      'name': file.fileName
    });

    this.http
      .get('http://localhost:3000/status', { headers: headers })
        .subscribe((res: any) => {
          file.uploadedBytes = res.uploaded;
          file.uploadPercent = Math.round(100 * file.uploadedBytes / file.selectedFile.size);

          if (file.uploadPercent >= 100) {
            file.uploadCompleted = true;
          }
        }, err => {
          console.log(err);
        });
  }

  resumeUpload(file) {
    let headers2 = new HttpHeaders({
      'size': file.selectedFile.size.toString(),
      'x-file-id': file.fileId,
      'x-start-byte': file.uploadedBytes.toString(),
      'name': file.fileName
    });

    const req = new HttpRequest(
      'POST',
      'http://localhost:3000/upload',
      file.selectedFile.slice(file.uploadedBytes, file.selectedFile.size + 1), 
      { headers: headers2, reportProgress: true }
    );
    
    this.http.request(req)
      .subscribe(
        (res: any) => {
          if (res.type === HttpEventType.UploadProgress) {
            file.updatedSize =  res.loaded ? file.uploadedBytes + res.loaded : file.uploadedBytes;
            file.uploadPercent =  Math.round(100 * (file.uploadedBytes + res.loaded) / file.selectedFile.size);
            console.log(file.uploadPercent, file.uploadedBytes, res.loaded, res.total);
            if(file.uploadPercent >= 100){
              file.uploadCompleted = true;
            }
          } else {
            console.log(JSON.stringify(res));
            if(this.uploadPercent >= 100){
              file.uploadCompleted = true;
            }
          }
        },
        err => {}
      );
  }

  deleteFile(file) {
    this.selectedFiles.splice(this.selectedFiles.indexOf(file), 1);
    console.log('====================================');
    console.log(file, ' Deleted');
    console.log('====================================');
  }

  formatSize(size) {
    const unit = 1024;
    const i = Math.floor(Math.log(size) / Math.log(1024));
    return (size / Math.pow(unit, i)).toFixed(2) as any * 1 + ' ' + ['B', 'KB', 'MB', 'GB', 'TB'][i];
  }
}

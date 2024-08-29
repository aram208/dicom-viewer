import React, { useEffect, useState } from 'react';

import ModelboardToolBar from './dashboard-toolbar';
import { Box, Button, Card, Container } from '@mui/material';

import {
  readImageDicomFileSeries
} from '@itk-wasm/dicom';
import vtkITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';

import MPRView from '../quad-view/quad-view-main';
import DICOMReader from '../IO/file-reader';

export default function Dashboard() {

  const [imageData, setImageData] = useState(null);

  const [dicomFiles, setDicomFiles] = useState([]);

  const readDICOM = async () => {
    const { outputImage, webWorkerPool } = await readImageDicomFileSeries({ inputImages: dicomFiles });
    webWorkerPool.terminateWorkers();

    const vtkImageData = vtkITKHelper.convertItkToVtkImage(outputImage);

    setImageData(vtkImageData);

    return true;

  };

  useEffect(() => {

    const doStuff = async () => {
      // readSomething();
      readDICOM();
    }

    if (dicomFiles.length > 0) {
      doStuff();
    }
  }, [dicomFiles]);

  return (

    <Container
      maxWidth="xl"
      sx={{ p: 0, height: '88vh', width: '100%', border: '1px solid #A39992' }}
      disableGutters>
      {
        (imageData) ?
          <MPRView imageData={imageData} />
          :
          <DICOMReader dicomFiles={dicomFiles} setDicomFiles={setDicomFiles} />

      }

    </Container>

  )
}
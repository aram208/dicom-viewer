import { Container } from '@mui/material';
import React, { useEffect, useRef } from 'react';

import vtkCollection from '@kitware/vtk.js/Common/DataModel/Collection';
import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData';
import vtkImageMapper from '@kitware/vtk.js/Rendering/Core/ImageMapper';
import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice';
import vtkITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkInteractorStyleImage from '@kitware/vtk.js/Interaction/Style/InteractorStyleImage';
import vtkXMLImageDataReader from '@kitware/vtk.js/IO/XML/XMLImageDataReader';
import vtkImageReslice from '@kitware/vtk.js/Imaging/Core/ImageReslice';
import vtkMatrixBuilder from '@kitware/vtk.js/Common/Core/MatrixBuilder';

import {
  applyPresentationStateToImage,
  readDicomEncapsulatedPdf,
  structuredReportToHtml,
  structuredReportToText,
  readDicomTags,
  readImageDicomFileSeries,
  setPipelinesBaseUrl,
  getPipelinesBaseUrl,
} from "@itk-wasm/dicom"

import { readImage, readImageFileSeries } from '@itk-wasm/image-io';


export default function QuadView({ dicomFiles }) {
  // const vtkContainerRef = useRef(null);
  // const collection = vtkCollection.newInstance();

  const axialRef = useRef(null);
  const coronalRef = useRef(null);
  const sagittalRef = useRef(null);
  const volumeRef = useRef(null);

  useEffect(() => {

    if (dicomFiles.length > 0) {
      readDICOM();
    }

  }, [dicomFiles]);

  const readDICOM = async () => {
    // console.log(dicomFiles)
    const { outputImage, webWorkerPool, sortedFileNames } = await readImageDicomFileSeries({ inputImages: dicomFiles });
    webWorkerPool.terminateWorkers();
    // console.log(outputImage);


    const vtkImage = vtkITKHelper.convertItkToVtkImage(outputImage);

    setupView(axialRef.current, vtkImage, [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0]);  // Axial view
    setupView(coronalRef.current, vtkImage, [1, 0, 0, 0, 0, 0, 1, 0, 0, -1, 0, 0]);  // Coronal view
    setupView(sagittalRef.current, vtkImage, [0, 0, -1, 0, 1, 0, 0, 0, 0, 1, 0, 0]);  // Sagittal view

  }

  const setupView = (container, image, orientation) => {
    // const renderWindow = vtkRenderWindow.newInstance();
    // const renderWindowView = renderWindow.newAPISpecificView();
    // const rect = vtkContainerRef.current.getBoundingClientRect();
    // renderWindowView.setSize(rect.width, rect.height);
    // renderWindow.addView(renderWindowView);
    // renderWindowView.setContainer(vtkContainerRef.current);

    if (!container || !image) return;

    const renderWindow = vtkRenderWindow.newInstance();
    const renderer = vtkRenderer.newInstance();
    renderWindow.addRenderer(renderer);

    // Create the view and attach it to the container
    const view = renderWindow.newAPISpecificView();
    view.setContainer(container);

    // Set the size of the view based on the container size
    const { width, height } = container.getBoundingClientRect();
    view.setSize(width, height);
    renderWindow.addView(view);

    const interactor = vtkRenderWindowInteractor.newInstance();
    interactor.setView(view); 

    const style = vtkInteractorStyleImage.newInstance();
    interactor.setInteractorStyle(style);

    // Initialize and bind the interactor to the container
    interactor.initialize();
    interactor.bindEvents(container);

    const imageReslice = vtkImageReslice.newInstance();
    imageReslice.setInputData(image);

    // Apply orientation matrix using vtkMatrixBuilder
    const matrixBuilder = vtkMatrixBuilder.buildFromDegree().identity();

    // Depending on the orientation, apply the appropriate transformation
    if (orientation === 'axial') {
      matrixBuilder.rotateX(90);
    } else if (orientation === 'coronal') {
      matrixBuilder.rotateY(90);
    } else if (orientation === 'sagittal') {
      matrixBuilder.rotateZ(90);
    }

    matrixBuilder.apply(imageReslice.getResliceAxes());

    const imageMapper = vtkImageMapper.newInstance();
    imageMapper.setInputConnection(imageReslice.getOutputPort());

    const imageSlice = vtkImageSlice.newInstance();
    imageSlice.setMapper(imageMapper);

    renderer.addViewProp(imageSlice);
    renderer.resetCamera();
    renderWindow.render();

    // Resize the render window to fit the container
    const resizeObserver = new ResizeObserver(() => {
      const { width, height } = container.getBoundingClientRect();
      view.setSize(width, height);
      renderWindow.render();
    });
    resizeObserver.observe(container);

  };

  return (
    <Container maxWidth="xl" style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <div ref={axialRef} style={{ flex: 1 }} />
        <div ref={coronalRef} style={{ flex: 1, backgroundColor: 'black' }} />
      </div>
      <div style={{ display: 'flex', flex: 1 }}>
        <div ref={sagittalRef} style={{ flex: 1, backgroundColor: 'black' }} />
        <div ref={volumeRef} style={{ flex: 1, backgroundColor: 'black' }} />
      </div>
    </Container>
  )
}

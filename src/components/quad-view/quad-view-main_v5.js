    import React, { useEffect, useRef, useState } from 'react';

    import {
        readImageDicomFileSeries
    } from '@itk-wasm/dicom';

    import { Box, Container, Slider } from '@mui/material';

    import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
    import vtkFPSMonitor from '@kitware/vtk.js/Interaction/UI/FPSMonitor';
    import vtkImageReslice from '@kitware/vtk.js/Imaging/Core/ImageReslice';
    import vtkImageResliceMapper from '@kitware/vtk.js/Rendering/Core/ImageResliceMapper';
    import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice';
    import vtkInteractorStyleImage from '@kitware/vtk.js/Interaction/Style/InteractorStyleImage';
    import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';
    import vtkITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
    import vtkMatrixBuilder from '@kitware/vtk.js/Common/Core/MatrixBuilder';
    import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
    import vtkPlane from '@kitware/vtk.js/Common/DataModel/Plane';
    import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
    import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';

    export default function QuadView({ dicomFiles }) {
        const rootContainerRef = useRef(null);
        const [axialSlices, setAxialSlices] = useState([]);
        const [currentSliceIndex, setCurrentSliceIndex] = useState(60);


        const renderWindow = vtkRenderWindow.newInstance();
        const renderWindowView = renderWindow.newAPISpecificView();
        const iStyle = vtkInteractorStyleImage.newInstance();
        const tStyle = vtkInteractorStyleTrackballCamera.newInstance();
        const fpsMonitor = vtkFPSMonitor.newInstance();

        const readDICOM = async () => {
            const { outputImage, webWorkerPool } = await readImageDicomFileSeries({ inputImages: dicomFiles });
            webWorkerPool.terminateWorkers();

            const vtkImageData = vtkITKHelper.convertItkToVtkImage(outputImage);

            const [xDim, yDim, zDim] = vtkImageData.getDimensions();

            // Calculate axial slice index
            // the initially shown slice index
            const axialSliceIndex = Math.floor(zDim / 2);

            const axSlices = [];

            for (let z = 0; z < zDim; z++) {
                // Extract axial slice as before
                const axialSlice = extractAxialSlice(vtkImageData, z);
                axSlices.push(axialSlice);
            }

            setAxialSlices(axSlices);

            return true;

        };

        const extractAxialSlice = (imageData, z) => {
            // Ensure the z index is within the bounds of the image
            const dimensions = imageData.getDimensions();
            if (z < 0 || z >= dimensions[2]) {
                throw new Error(`Invalid Z index: ${z}. Must be between 0 and ${dimensions[2] - 1}.`);
            }

            // Create a reslice object
            const reslice = vtkImageReslice.newInstance();
            reslice.setInputData(imageData);

            // Set the slicing orientation: Axial (XY plane)
            const matrix = vtkMatrixBuilder.buildFromDegree().identity();
            reslice.setResliceAxes(matrix.getMatrix());

            // Specify the Z index for the slice
            reslice.setOutputExtent([0, dimensions[0] - 1, 0, dimensions[1] - 1, z, z]);

            // Extract the slice
            const sliceData = reslice.getOutputData();
            return sliceData

            // // Create mapper and slice for rendering
            // const imageMapper = vtkImageMapper.newInstance();
            // imageMapper.setInputData(sliceData);
            // const imageSlice = vtkImageSlice.newInstance();
            // imageSlice.setMapper(imageMapper);
            // return imageSlice;

        };

        const setupRendering = () => {

            const rect = rootContainerRef.current.getBoundingClientRect();
            // console.log(rect)
            renderWindowView.setSize(rect.width, rect.height);
            renderWindow.addView(renderWindowView);
            renderWindowView.setContainer(rootContainerRef.current);

            const renderer = vtkRenderer.newInstance();
            renderer.setViewport(0.01, 0.01, 0.98, 0.98);

            // ------ create inner container --------------
            if(document.querySelector('#axialRef')){
                return
            }
            const innerContainer = document.createElement('div');
            innerContainer.style.display = 'block';
            const border = 2;
            const vp = renderer.getViewport();
            const width = (vp[2] - vp[0]) * rect.width;
            const height = (vp[3] - vp[1]) * rect.height;
            const x = vp[0] * rect.width;
            const y = vp[1] * rect.height;
            // console.log(width, height, x, y)
            innerContainer.style.position = 'absolute';
            innerContainer.style.width = `${width}px`;
            innerContainer.style.height = `${height}px`;
            innerContainer.style.left = `${rect.left}px`;
            innerContainer.style.top = `${rect.top}px`;
            innerContainer.style.border = `solid ${border}px darkcyan`;
            innerContainer.id = 'axialRef'
            
            rootContainerRef.current.appendChild(innerContainer);
            console.log(innerContainer)
            // ---------------------------------------------
            // const fpsElm = fpsMonitor.getFpsMonitorContainer();
            // fpsMonitor.setContainer(rootContainerRef.current);
            // fpsMonitor.setRenderWindow(renderWindow);
            //----------------------------------------------

            // create slicing pieline
            const amapper = vtkImageResliceMapper.newInstance();
            const aslicePlane = vtkPlane.newInstance();
            aslicePlane.setNormal(0, 0, 1);
            amapper.setSlicePlane(aslicePlane);

            const ctf = vtkColorTransferFunction.newInstance();
            ctf.addRGBPoint(0, 0, 0.25, 0.15);
            ctf.addRGBPoint(600, 0.5, 0.5, 0.5);
            ctf.addRGBPoint(3120, 0.2, 0, 0);
            const pf = vtkPiecewiseFunction.newInstance();
            pf.addPoint(0, 0.0);
            pf.addPoint(100, 0.0);
            pf.addPoint(3120, 1.0);

            // --------- actor -------------
            const aactor = vtkImageSlice.newInstance();
            aactor.setMapper(amapper);
            aactor.getProperty().setColorWindow(2120);
            aactor.getProperty().setColorLevel(2000);
            aactor.getProperty().setRGBTransferFunction(0, ctf);
            renderer.addActor(aactor);
            let cam = renderer.getActiveCamera();
            cam.setParallelProjection(true);


            // reading the data
            const im = axialSlices[60];
            amapper.setInputData(im);
            console.log(im.getClassName());
            console.log(im.getCenter());
            // aslicePlane.setOrigin(0, 0, 60);
            aslicePlane.setOrigin(im.getCenter());

            renderer.resetCamera();
            renderWindow.render();

        };

        const updateSlice = (index) => {
            // const imageMapper = imageSliceRef.current.getMapper();
            // imageMapper.setInputData(axialSlices[index]);
            // rendererRef.current.resetCamera();
            // renderWindowRef.current.render();
        };

        const handleSliderChange = (event, newValue) => {
            setCurrentSliceIndex(newValue);
            // updateSlice(newValue);
        };

        useEffect(() => {

            const doStuff = async () => {
                readDICOM();
            }

            if (dicomFiles.length > 0) {
                doStuff();
            }
        }, [dicomFiles]);

        useEffect(() => {
            if(rootContainerRef.current && axialSlices.length > 0){
                setupRendering();
            }
        }, [rootContainerRef.current, axialSlices])

        return (
            <>
                <div id="rootCont" ref={rootContainerRef} style={{ height: '500px', width: '100%'}} />
                <Slider
                    value={currentSliceIndex}
                    min={0}
                    max={axialSlices.length - 1}
                    step={1}
                    onChange={handleSliderChange}
                    aria-labelledby="axial-slice-slider"
                />
            </>
        );
    }

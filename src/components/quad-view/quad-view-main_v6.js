import React, { useEffect, useRef, useState } from 'react';

import {
    readImageDicomFileSeries
} from '@itk-wasm/dicom';

import { Box, Container, Grid, Slider } from '@mui/material';

// import vtkHttpDataAccessHelper from '@kitware/vtk.js/IO/Core/DataAccessHelper/HttpDataAccessHelper';
import vtkLiteHttpDataAccessHelper from '@kitware/vtk.js/IO/Core/DataAccessHelper/LiteHttpDataAccessHelper';

import '@kitware/vtk.js/Rendering/Profiles/Volume';

import vtkImageReslice from '@kitware/vtk.js/Imaging/Core/ImageReslice';
import vtkInteractorStyleImage from '@kitware/vtk.js/Interaction/Style/InteractorStyleImage';
import vtkITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
import vtkMatrixBuilder from '@kitware/vtk.js/Common/Core/MatrixBuilder';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';

// import vtkFPSMonitor from '@kitware/vtk.js/Interaction/UI/FPSMonitor';
// import vtkImageResliceMapper from '@kitware/vtk.js/Rendering/Core/ImageResliceMapper';
// import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice';
// import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';
// import vtkPlane from '@kitware/vtk.js/Common/DataModel/Plane';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';

export default function QuadView({ dicomFiles }) {
    const rootContainerRef = useRef(null);
    const rootContainerRef2 = useRef(null);
    const [axialSlices, setAxialSlices] = useState([]);
    const [currentSliceIndex, setCurrentSliceIndex] = useState(60);

    const [imageData, setImageData] = useState(null);

    // const renderWindow = vtkRenderWindow.newInstance();
    // const renderWindowView = renderWindow.newAPISpecificView();
    // const iStyle = vtkInteractorStyleImage.newInstance();
    // const tStyle = vtkInteractorStyleTrackballCamera.newInstance();

    const readDICOM_1 = async () => {
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

    const readDICOM_2 = async () => {
        const { outputImage, webWorkerPool } = await readImageDicomFileSeries({ inputImages: dicomFiles });
        webWorkerPool.terminateWorkers();

        const vtkImageData = vtkITKHelper.convertItkToVtkImage(outputImage);

        setImageData(vtkImageData);

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

    // =========================================================
    const setupVolumeRendering = async () => {

        const container = rootContainerRef.current;

        const genericRenderWindow = vtkGenericRenderWindow.newInstance();
        // const genericRenderWindow = vtkFullScreenRenderWindow.newInstance();
        genericRenderWindow.setContainer(rootContainerRef.current);
        genericRenderWindow.resize();

        // const renderer = genericRenderWindow.getRenderer();
        const renderer = vtkRenderer.newInstance();
        renderer.setViewport(0.01, 0.01, 0.49, 0.49);
        const renderWindow = genericRenderWindow.getRenderWindow();
        renderWindow.addRenderer(renderer);

        const actor = vtkVolume.newInstance();
        const mapper = vtkVolumeMapper.newInstance();

        // mapper.setSampleDistance(0.7);
        actor.setMapper(mapper);

        // -----------------------------------
        // COLOR TRANSFER : BEGIN
        // -----------------------------------
        const ctfun = vtkColorTransferFunction.newInstance();
        ctfun.applyColorMap(vtkColorMaps.getPresetByName('Cool to Warm'));
        ctfun.setMappingRange(0, 256);
        ctfun.updateRange();

        actor.getProperty().setRGBTransferFunction(0, ctfun);

        // -----------------------------------
        // COLOR TRANSFER : END
        // -----------------------------------

        // -----------------------------------
        // OPACITY : BEGIN
        // -----------------------------------
        const ofun = vtkPiecewiseFunction.newInstance();
        // set up simple linear opacity function
        // this assumes a data range of 0 - 256
        for (let i = 0; i <= 8; i++) {
            ofun.addPoint(i * 32, i / 8);
        }
        actor.getProperty().setScalarOpacity(0, ofun);
        // -----------------------------------
        // OPACITY : END
        // -----------------------------------

        mapper.setInputData(imageData);

        renderer.addVolume(actor);

        renderer.resetCamera();
        renderer.getActiveCamera().zoom(1.5);
        renderer.getActiveCamera().elevation(70);
        renderer.updateLightsGeometryToFollowCamera();
        renderWindow.render();


    };

    // =========================================================

    useEffect(() => {

        const doStuff = async () => {
            // readSomething();
            readDICOM_2();
        }

        if (dicomFiles.length > 0) {
            doStuff();
        }
    }, [dicomFiles]);

    // useEffect(() => {
    //     if (rootContainerRef.current && axialSlices.length > 0) {
    //         setupRendering();
    //     }
    // }, [rootContainerRef.current, axialSlices])

    useEffect(() => {
        if (rootContainerRef.current && imageData) {
            setupVolumeRendering();
        }
    }, [rootContainerRef.current, imageData])

    return (

        <Grid container spacing={2} sx={{mt: 3}}>
            <Grid item xs={12} sm={6}>
                <Box id="rootCont" ref={rootContainerRef} sx={{ height: '600px', width: '600px', border: '1px solid grey' }} />
            </Grid>
            <Grid item xs={12} sm={6}>
                <Box id="rootCont2" ref={rootContainerRef2} sx={{ height: '600px', width: '600px', border: '1px solid grey' }} />
            </Grid>
            {/* <Slider
                value={currentSliceIndex}
                min={0}
                max={axialSlices.length - 1}
                step={1}
                onChange={handleSliderChange}
                aria-labelledby="axial-slice-slider"
            /> */}
        </Grid>
            

    );
}

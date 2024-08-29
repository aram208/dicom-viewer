import React, { useEffect, useRef, useState } from 'react';
import { Container } from '@mui/material';
import {
    readImageDicomFileSeries
} from '@itk-wasm/dicom';

import { Box, Slider } from '@mui/material';

import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
// import vtkImageMapper from '@kitware/vtk.js/Rendering/OpenGL/ImageMapper';
import vtkImageData from '@kitware/vtk.js/Common/DataModel/ImageData';
import vtkImageMapper from '@kitware/vtk.js/Rendering/Core/ImageMapper';
import vtkImageReslice from '@kitware/vtk.js/Imaging/Core/ImageReslice';
import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';
import vtkITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkMatrixBuilder from '@kitware/vtk.js/Common/Core/MatrixBuilder';
import vtkOpenGLRenderWindow from '@kitware/vtk.js/Rendering/OpenGL/RenderWindow';
import vtkPlane from '@kitware/vtk.js/Common/DataModel/Plane';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkRenderWindowWithControlBar from '@kitware/vtk.js/Rendering/Misc/RenderWindowWithControlBar';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkImageResliceMapper from '@kitware/vtk.js/Rendering/Core/ImageResliceMapper'

import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';
import vtkInteractorStyleImage from '@kitware/vtk.js/Interaction/Style/InteractorStyleImage';
import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';

export default function QuadView({ dicomFiles }) {
    const vtkContainerRef = useRef(null);
    const [axialSlices, setAxialSlices] = useState([]);
    const [currentSliceIndex, setCurrentSliceIndex] = useState(60);
    const rendererRef = useRef(null);
    const renderWindowRef = useRef(null);
    const imageSliceRef = useRef(null);

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

    };

    useEffect(() => {
        if (dicomFiles.length > 0) {
            readDICOM();
            setupRendering();
        }
    }, [dicomFiles]);

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
        const genericRenderWindow = vtkGenericRenderWindow.newInstance();

        genericRenderWindow.setContainer(vtkContainerRef.current);
        const renderer = genericRenderWindow.getRenderer();
        const renderWindow = genericRenderWindow.getRenderWindow();
        const interactor = genericRenderWindow.getInteractor();
        interactor.setInteractorStyle(vtkInteractorStyleImage.newInstance());

        const imageMapper = vtkImageMapper.newInstance();
        imageMapper.setInputData(axialSlices[60]);
        imageMapper.setSlicingMode(vtkImageMapper.SlicingMode.K);
    
        const imageSlice = vtkImageSlice.newInstance();
        imageSlice.setMapper(imageMapper);
    
        renderer.addViewProp(imageSlice);
        renderer.resetCamera();
        renderWindow.render();

        /*
        const renderWindow = vtkRenderWindow.newInstance();
        const renderer = vtkRenderer.newInstance();
        renderWindow.addRenderer(renderer);

        const view = renderWindow.newAPISpecificView();
        view.setContainer(vtkContainerRef.current);
        view.setSize(
            vtkContainerRef.current.clientWidth,
            vtkContainerRef.current.clientHeight
        );
        renderWindow.addView(view);

        const imageSlice = vtkImageSlice.newInstance();
        const imageMapper = vtkImageMapper.newInstance();
        imageSlice.setMapper(imageMapper);
        
        // const imageSlice = axialSlices[60]; // <- vtkImageData
        // console.log(imageSlice.getClassName());
        renderer.addActor(imageSlice);

        rendererRef.current = renderer;
        renderWindowRef.current = renderWindow;
        imageSliceRef.current = imageSlice;

        renderer.resetCamera();
        renderWindow.render();
        */
    };

    const updateSlice = (index) => {
        const imageMapper = imageSliceRef.current.getMapper();
        imageMapper.setInputData(axialSlices[index]);

        rendererRef.current.resetCamera();
        renderWindowRef.current.render();
    };

    const handleSliderChange = (event, newValue) => {
        setCurrentSliceIndex(newValue);
        updateSlice(newValue);
    };

    // useEffect(() => {
    //     if (vtkContainerRef.current && axialSlices.length > 0) {
    //         // Setup vtk.js rendering
    //         console.log("setting up vtk rendering")
    //         setupRendering();
    //         updateSlice(currentSliceIndex);
    //     }
    // }, [axialSlices])

    return (
        <>
            <div ref={vtkContainerRef} style={{ height: '500px', width: '100%'}} />
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

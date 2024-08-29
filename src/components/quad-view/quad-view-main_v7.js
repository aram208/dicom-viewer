import React, { useEffect, useRef, useState } from 'react';

import {
    readImageDicomFileSeries
} from '@itk-wasm/dicom';

import { Box, Container, Grid, Slider } from '@mui/material';

import '@kitware/vtk.js/Rendering/Profiles/All';

import vtkITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';
import vtkImageMapper from '@kitware/vtk.js/Rendering/Core/ImageMapper';
import vtkImageResliceMapper from '@kitware/vtk.js/Rendering/Core/ImageResliceMapper';
import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';
import vtkInteractorStyleImage from '@kitware/vtk.js/Interaction/Style/InteractorStyleImage';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import vtkPlane from '@kitware/vtk.js/Common/DataModel/Plane';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import ImageConstants from '@kitware/vtk.js/Rendering/Core/ImageMapper/Constants'

const { SlicingMode } = ImageConstants;

export default function QuadView({ dicomFiles }) {
    const rootContainerRef = useRef(null);
    const [axialSlices, setAxialSlices] = useState([]);
    const [currentSliceIndex, setCurrentSliceIndex] = useState(60);

    const [imageData, setImageData] = useState(null);

    const iStyle = vtkInteractorStyleImage.newInstance();
    const tStyle = vtkInteractorStyleTrackballCamera.newInstance();

    const readDICOM = async () => {
        const { outputImage, webWorkerPool } = await readImageDicomFileSeries({ inputImages: dicomFiles });
        webWorkerPool.terminateWorkers();

        const vtkImageData = vtkITKHelper.convertItkToVtkImage(outputImage);

        setImageData(vtkImageData);

        return true;

    };

    const bindInteractor = (interactor, el) => {
        // only change the interactor's container if needed
        if (interactor.getContainer() !== el) {
            if (interactor.getContainer()) {
                interactor.unbindEvents();
            }
            if (el) {
                // const { id } = el;
                // if (id === '3') {
                //     interactor.setInteractorStyle(tStyle);
                // } else {
                interactor.setInteractorStyle(iStyle);
                // }
                interactor.bindEvents(el);
            }
        }
    }

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
        const containerRect = container.getBoundingClientRect();

        const renderWindow = vtkRenderWindow.newInstance();
        const renderWindowView = renderWindow.newAPISpecificView();
        renderWindowView.setSize(containerRect.width, containerRect.height);
        renderWindow.addView(renderWindowView);
        renderWindowView.setContainer(container);


        const renderer = vtkRenderer.newInstance();
        renderer.setViewport(0.01, 0.49, 0.49, 0.99);
        renderWindow.addRenderer(renderer);

        // renderer.getActiveCamera().setParallelProjection(true);

        // --------------------------------------------        
        // const iStyle = vtkInteractorStyleImage.newInstance();
        // iStyle.setInteractionMode('IMAGE3D');
        // renderWindow.getInteractor().setInteractorStyle(iStyle);

        const interactor = vtkRenderWindowInteractor.newInstance();
        interactor.setView(renderWindowView);
        interactor.initialize();
        // interactor.setInteractorStyle(tStyle);

        container.addEventListener('pointerenter', () =>
            bindInteractor(interactor, container)
        );
        container.addEventListener('pointerleave', () =>
            bindInteractor(interactor, null)
        );


        // const actor = vtkVolume.newInstance();
        // const mapper = vtkVolumeMapper.newInstance();
        const actor = vtkImageSlice.newInstance();
        // const mapper = vtkImageMapper.newInstance();
        const mapper = vtkImageResliceMapper.newInstance();

        // mapper.setSliceAtFocalPoint(true);
        // mapper.setSlicingMode(SlicingMode.Z);

        actor.setMapper(mapper);

        // set piecewisefunction
        const pf = vtkPiecewiseFunction.newInstance();
        pf.addPoint(0, 0.0);
        pf.addPoint(100, 0.0);
        pf.addPoint(3120, 1.0);
        
        
        // --- set up default window/level ---
        actor.getProperty().setColorWindow(255);
        actor.getProperty().setColorLevel(100);
        //actor.getProperty().setPiecewiseFunction(pf);

        // --- axial slice plane prep
        const aslicePlane = vtkPlane.newInstance();
        aslicePlane.setNormal(0, 1, 0);
        mapper.setSlicePlane(aslicePlane);

        // ----- set the camera ---------
        let cam = renderer.getActiveCamera();
        cam.setParallelProjection(true);
        cam.setPosition(0, 0, 0);
        cam.setFocalPoint(0, 1, 0);
        cam.setViewUp(0, 0, -1);
        
        // ----- set the data ----------------
        const bds = imageData.extentToBounds(imageData.getExtent());
        mapper.setInputData(imageData);
        
        // normal(0, 0, 1)
        // aslicePlane.setOrigin(bds[0], bds[2], 0.5 * (bds[5] + bds[4]));
        
        // normal(0, 1, 0)
        aslicePlane.setOrigin(bds[0], 0.5 * (bds[2] + bds[3]), bds[4]);

        // --- Add volume actor to scene ---
        renderer.addActor(actor);

        // --- Reset camera and render the scene ---
        renderer.resetCamera();
        renderWindow.render();

    };

    // =========================================================

    useEffect(() => {

        const doStuff = async () => {
            // readSomething();
            readDICOM();
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

        <Grid container spacing={2} sx={{ mt: 3 }}>
            <Grid item xs={12} sm={6}>
                <Box id="rootCont" ref={rootContainerRef} sx={{ height: '600px', width: '600px', border: '1px solid grey' }} />
            </Grid>
            <Grid item xs={12} sm={6}>
                &nbsp;
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

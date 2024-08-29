import React, { useEffect, useRef, useState } from 'react';
import { Box, Container } from '@mui/material';

import vtkRenderWindowWithControlBar from '@kitware/vtk.js/Rendering/Misc/RenderWindowWithControlBar';
import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';
import vtkImageMapper from '@kitware/vtk.js/Rendering/Core/ImageMapper';
import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeProperty from '@kitware/vtk.js/Rendering/Core/VolumeProperty';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkITKHelper from '@kitware/vtk.js/Common/DataModel/ITKHelper';
import vtkHttpDataSetReader from '@kitware/vtk.js/IO/Core/HttpDataSetReader';
import vtkInteractorStyleImage from '@kitware/vtk.js/Interaction/Style/InteractorStyleImage';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkImageResliceMapper from '@kitware/vtk.js/Rendering/Core/ImageResliceMapper';
import vtkPlane from '@kitware/vtk.js/Common/DataModel/Plane';

const RENDERERS = [];

export default function QuadView({ dicomFiles }) {

    const iStyle = vtkInteractorStyleImage.newInstance();
    // iStyle.setInteractionMode('IMAGE3D');
    const tStyle = vtkInteractorStyleTrackballCamera.newInstance();

    const rootContainer = useRef(null);
    const axialRef = useRef(null);
    const coronalRef = useRef(null);
    const sagittalRef = useRef(null);
    const volumeRef = useRef(null);

    const CONTAINERS = useState([ sagittalRef, axialRef, volumeRef, coronalRef]);

    const resizeViewportContainer = (view, ren, element) => {
        const rect = view.getBoundingClientRect();
        const vp = ren.getViewport();
        // Compensate for the border size
        const border = 5;
        const width = (vp[2] - vp[0]) * rect.width - border;
        const height = (vp[3] - vp[1]) * rect.height - border;
        const x = vp[0] * rect.width;
        const y = vp[1] * rect.height;
        element.style.position = 'relative';
        element.style.width = `${width}px`;
        element.style.height = `${height}px`;
        element.style.left = `${x + 230}px`;
        element.style.bottom = `${y + 60}px`;
        element.style.border = `solid ${border}px darkcyan`;
      };

    useEffect(() => {

        const initializeRenderWindowView = () => {
            const renderWindow = vtkRenderWindow.newInstance();
            const renderWindowView = renderWindow.newAPISpecificView();
            const rect = rootContainer.current.getBoundingClientRect();
            console.log(rootContainer.current);
            console.log(axialRef.current);
            //console.log(rect)
            renderWindowView.setSize(rect.width, rect.height);
            renderWindow.addView(renderWindowView);
            renderWindowView.setContainer(rootContainer.current);

            const interactor = vtkRenderWindowInteractor.newInstance();
            interactor.setView(renderWindowView);
            interactor.initialize();
            interactor.setInteractorStyle(tStyle);

            return [renderWindow, renderWindowView];
        }

        // if(axialRef.current && coronalRef.current && sagittalRef.current && volumeRef.current){
        //     const axialView = initializeRenderWindowView(axialRef.current);
        //     const coronalView = initializeRenderWindowView(coronalRef.current);
        //     const sagittalView = initializeRenderWindowView(sagittalRef.current);
        //     const volumeView = initializeRenderWindowView(volumeRef.current);
        // }

        if(rootContainer.current && axialRef.current && coronalRef.current && sagittalRef.current && volumeRef.current){
            const [renW, renWV] = initializeRenderWindowView();

            let id = 0;
            for (let i = 0; i < 2; ++i) {
                for (let j = 0; j < 2; ++j) {
                    const ren = vtkRenderer.newInstance();
                    ren.setViewport(
                      (i % 2) * 0.51 + 0.01,
                      (j % 2) * 0.51 + 0.01,
                      (i % 2) * 0.5 + 0.48,
                      (j % 2) * 0.5 + 0.48
                    );
                    
                    // resizeViewportContainer(rootContainer.current, ren, CONTAINERS[0][id].current);
                    id += 1;
                    renW.addRenderer(ren);
                    RENDERERS.push(ren);
                }
            }

            // Create the three slicing pipelines
            const amapper = vtkImageResliceMapper.newInstance();
            const cmapper = vtkImageResliceMapper.newInstance();
            const smapper = vtkImageResliceMapper.newInstance();

            const aslicePlane = vtkPlane.newInstance();
            aslicePlane.setNormal(0, 0, 1);
            amapper.setSlicePlane(aslicePlane);
            const cslicePlane = vtkPlane.newInstance();
            cslicePlane.setNormal(0, 1, 0);
            cmapper.setSlicePlane(cslicePlane);
            const sslicePlane = vtkPlane.newInstance();
            sslicePlane.setNormal(1, 0, 0);
            smapper.setSlicePlane(sslicePlane);

            const ctf = vtkColorTransferFunction.newInstance();
            ctf.addRGBPoint(0, 0, 0.25, 0.15);
            ctf.addRGBPoint(600, 0.5, 0.5, 0.5);
            ctf.addRGBPoint(3120, 0.2, 0, 0);
            const pf = vtkPiecewiseFunction.newInstance();
            pf.addPoint(0, 0.0);
            pf.addPoint(100, 0.0);
            pf.addPoint(3120, 1.0);

            const aactor = vtkImageSlice.newInstance();
            aactor.setMapper(amapper);
            aactor.getProperty().setColorWindow(2120);
            aactor.getProperty().setColorLevel(2000);
            aactor.getProperty().setRGBTransferFunction(0, ctf);
            RENDERERS[0].addActor(aactor);
            let cam = RENDERERS[0].getActiveCamera();
            cam.setParallelProjection(true);
            
            const cactor = vtkImageSlice.newInstance();
            cactor.setMapper(cmapper);
            cactor.getProperty().setColorWindow(3120);
            cactor.getProperty().setColorLevel(100);
            cactor.getProperty().setPiecewiseFunction(pf);
            RENDERERS[1].addActor(cactor);
            cam = RENDERERS[1].getActiveCamera();
            cam.setParallelProjection(true);
            cam.setPosition(0, 0, 0);
            cam.setFocalPoint(0, 1, 0);
            cam.setViewUp(0, 0, -1);
            
            const sactor = vtkImageSlice.newInstance();
            sactor.setMapper(smapper);
            sactor.getProperty().setColorWindow(3120);
            sactor.getProperty().setColorLevel(1000);
            cam = RENDERERS[2].getActiveCamera();
            cam.setParallelProjection(true);
            cam.setPosition(0, 0, 0);
            cam.setFocalPoint(1, 0, 0);
            cam.setViewUp(0, 0, -1);
            RENDERERS[2].addActor(sactor);

        }


    }, []);

    return (
        <Box ref={rootContainer} 
            display="grid" 
            gridTemplateColumns="1fr 1fr" 
            gridTemplateRows="1fr 1fr" 
            gap="10px" 
            bgcolor="#888"
            height="85vh"
            sx={{zIndex: '-1'}}>
            <Box ref={axialRef} sx={{m: 0, display: 'block', boxSizing: 'border', textAlign: 'center', color: 'cyan', borderRadius: '5px'}} />
            <Box ref={coronalRef} bgcolor="blue"  />
            <Box ref={sagittalRef} bgcolor="#444" />
            <Box ref={volumeRef} bgcolor="green" ></Box>
        </Box>
    )
}
import { useEffect, useRef, useState } from 'react';

import '@kitware/vtk.js/Rendering/Profiles/Volume';
import vtkColorMaps from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction/ColorMaps';
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkImageResliceMapper from '@kitware/vtk.js/Rendering/Core/ImageResliceMapper';
import vtkImageSlice from '@kitware/vtk.js/Rendering/Core/ImageSlice';
import vtkInteractorStyleImage from '@kitware/vtk.js/Interaction/Style/InteractorStyleImage';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';
import vtkPiecewiseFunction from '@kitware/vtk.js/Common/DataModel/PiecewiseFunction';
import vtkPlane from '@kitware/vtk.js/Common/DataModel/Plane';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Core/RenderWindow';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkVolume from '@kitware/vtk.js/Rendering/Core/Volume';
import vtkVolumeMapper from '@kitware/vtk.js/Rendering/Core/VolumeMapper';

import { Box, Grid } from '@mui/material';
import VolumeViewer from './quad-view-3D';

export default function MPRView({ imageData }) {

  const rootContainerRef = useRef(null);
  const volumeContainerRef = useRef(null);
  const axialContainerRef = useRef(null);
  const coronalContainerRef = useRef(null);
  const sagittalContainerRef = useRef(null);

  const iStyle = vtkInteractorStyleImage.newInstance();
  const tStyle = vtkInteractorStyleTrackballCamera.newInstance();

  const RENDERERS = [];
  const CONTAINERS = [];

  const resizeViewportContainer = (view, ren, element) => {
    const rect = view.getBoundingClientRect();
    const vp = ren.getViewport();
    // Compensate for the border size
    const border = 5;
    const width = (vp[2] - vp[0]) * rect.width - border;
    const height = (vp[3] - vp[1]) * rect.height - border;
    const x = vp[0] * rect.width;
    const y = vp[1] * rect.height;
    element.style.position = 'absolute';
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    element.style.left = `${x}px`;
    element.style.bottom = `${y}px`;
    element.style.border = `solid ${border}px darkcyan`;
  }

  const bindInteractor = (interactor, el) => {
    // only change the interactor's container if needed
    if (interactor.getContainer() !== el) {
      if (interactor.getContainer()) {
        interactor.unbindEvents();
      }
      if (el) {
        const { id } = el;
        if (id === '0') {
          interactor.setInteractorStyle(tStyle);
        } else {
          interactor.setInteractorStyle(iStyle);
        }
        interactor.bindEvents(el);
      }
    }
  }

  const applyStyle = (view, ren, element) => {
    element.classList.add('renderer');
    // element.style.margin = '0px';
    // element.style.display = 'block';
    // element.style.boxSizing = 'border';
    // element.style.textAlign = 'center';
    // element.style.color = 'gray';
    // element.style.borderRadius = '5px';
    // resizeViewportContainer(view, ren, element);
    return element;
  }

  const setupRenderers = () => {

    const rootContainer = rootContainerRef.current;
    const rootContainerRect = rootContainer.getBoundingClientRect();
    console.log(rootContainerRect);

    const renderWindow = vtkRenderWindow.newInstance();
    const renderWindowView = renderWindow.newAPISpecificView();
    renderWindowView.setSize(rootContainerRect.width, rootContainerRect.height);
    renderWindow.addView(renderWindowView);
    renderWindowView.setContainer(rootContainer);


    const volume_renderer = vtkRenderer.newInstance();
    volume_renderer.setViewport(0, 0.5, 0.5, 1);
    renderWindow.addRenderer(volume_renderer);

    const coronal_renderer = vtkRenderer.newInstance();
    coronal_renderer.setViewport(0.5, 0.5, 1, 1);
    renderWindow.addRenderer(coronal_renderer);

    const sagittal_renderer = vtkRenderer.newInstance();
    sagittal_renderer.setViewport(0., 0., 0.5, 0.5);
    renderWindow.addRenderer(sagittal_renderer);

    const axial_renderer = vtkRenderer.newInstance();
    axial_renderer.setViewport(0.5, 0., 1, 0.5);
    renderWindow.addRenderer(axial_renderer);

    // =============================================================
    
    const interactor = vtkRenderWindowInteractor.newInstance();
    interactor.setView(renderWindowView);
    interactor.initialize();
    
    // ------------------------------------------
    // ------- BEGIN: VOLUME CONTAINER SETUP ----
    // ------------------------------------------

    const volume_container = volumeContainerRef.current;
    const rect = rootContainer.getBoundingClientRect();
    const width = rect.width / 2;
    const height = rect.height / 2 + 15;
    
    volume_container.style.position = 'absolute';
    volume_container.style.width = `${width}px`;
    volume_container.style.height = `${height}px`;
    volume_container.style.border = '3px solid #A39992';
    
    // volume_interactor.setInteractorStyle(tStyle);
    // volume_interactor.setContainer(volume_container);

    volume_container.addEventListener('pointerenter', () =>
      bindInteractor(interactor, volume_container)
    );
    volume_container.addEventListener('pointerleave', () =>
      bindInteractor(interactor, null)
    );

    const volume_actor = vtkVolume.newInstance();
    const volume_mapper = vtkVolumeMapper.newInstance();
    volume_actor.setMapper(volume_mapper);

    // -----------------------------------
    // COLOR TRANSFER : BEGIN
    // -----------------------------------
    const ctfun = vtkColorTransferFunction.newInstance();
    ctfun.applyColorMap(vtkColorMaps.getPresetByName('Cool to Warm'));
    ctfun.setMappingRange(0, 256);
    ctfun.updateRange();
    // -----------------------------------
    // OPACITY : BEGIN
    // -----------------------------------
    const ofun = vtkPiecewiseFunction.newInstance();
    // set up simple linear opacity function
    // this assumes a data range of 0 - 256
    for (let i = 0; i <= 8; i++) {
        ofun.addPoint(i * 32, i / 8);
    }
    volume_actor.getProperty().setScalarOpacity(0, ofun);
    volume_actor.getProperty().setRGBTransferFunction(0, ctfun);
    
    volume_mapper.setInputData(imageData);

    volume_renderer.addVolume(volume_actor);

    volume_renderer.getActiveCamera().zoom(1.5);
    volume_renderer.getActiveCamera().setParallelProjection(true);
    volume_renderer.getActiveCamera().elevation(70);
    volume_renderer.updateLightsGeometryToFollowCamera();
    volume_renderer.resetCamera();
    // ------------------------------------------
    // ------- END: VOLUME CONTAINER SETUP ----
    // ------------------------------------------
    // ------------------------------------------
    // ------- BEGIN: CORONAL CONTAINER SETUP ----
    // ------------------------------------------    
    const coronal_container = coronalContainerRef.current;
    
    coronal_container.style.position = 'absolute';
    coronal_container.style.width = `${width}px`;
    coronal_container.style.height = `${height}px`;
    coronal_container.style.border = '3px solid #A39992';
    coronal_container.style.display = 'flex';
    coronal_container.style.justifyContent = 'flex-end';
    
    coronal_container.addEventListener('pointerenter', () =>
      bindInteractor(interactor, coronal_container)
    );
    coronal_container.addEventListener('pointerleave', () =>
      bindInteractor(interactor, null)
    );
    const vol_cont_rect = volume_container.getBoundingClientRect();
    coronal_container.style.left = `${vol_cont_rect.x + vol_cont_rect.width}px`;
    
    const coronal_actor = vtkImageSlice.newInstance();
    const coronal_mapper = vtkImageResliceMapper.newInstance();
    coronal_actor.setMapper(coronal_mapper);
    coronal_renderer.addActor(coronal_actor);

    coronal_actor.getProperty().setColorWindow(255);
    coronal_actor.getProperty().setColorLevel(100);

    const cSlicePlane = vtkPlane.newInstance();
    cSlicePlane.setNormal(0, 1, 0);
    coronal_mapper.setSlicePlane(cSlicePlane);

    let coronal_cam = coronal_renderer.getActiveCamera();
    coronal_cam.setParallelProjection(true);
    coronal_cam.setPosition(0, 0, 0);
    coronal_cam.setFocalPoint(0, 1, 0);
    coronal_cam.setViewUp(0, 0, 1);

    const bds = imageData.extentToBounds(imageData.getExtent());
    coronal_mapper.setInputData(imageData);

    cSlicePlane.setOrigin(bds[0], 0.5 * (bds[2] + bds[3]), bds[4]);

    coronal_renderer.resetCamera();
    coronal_cam.setParallelScale(coronal_cam.getParallelScale() * 0.75); // zooming
    // ------------------------------------------
    // ------- END: CORONAL CONTAINER SETUP -------
    // ------------------------------------------
    // ------------------------------------------
    // ------- BEGIN: SAGITTAL CONTAINER SETUP ---
    // ------------------------------------------    
    const sagittal_container = sagittalContainerRef.current;
    
    sagittal_container.style.position = 'absolute';
    sagittal_container.style.width = `${width}px`;
    sagittal_container.style.height = `${height}px`;
    sagittal_container.style.bottom = '0px'
    sagittal_container.style.border = '3px solid #A39992';
    
    sagittal_container.addEventListener('pointerenter', () =>
      bindInteractor(interactor, sagittal_container)
    );
    sagittal_container.addEventListener('pointerleave', () =>
      bindInteractor(interactor, null)
    );

    const sagittal_actor = vtkImageSlice.newInstance();
    const sagittal_mapper = vtkImageResliceMapper.newInstance();
    sagittal_actor.setMapper(sagittal_mapper);
    sagittal_renderer.addActor(sagittal_actor);

    sagittal_actor.getProperty().setColorWindow(255);
    sagittal_actor.getProperty().setColorLevel(100);

    const sSlicePlane = vtkPlane.newInstance();
    sSlicePlane.setNormal(1, 0, 0);
    sagittal_mapper.setSlicePlane(sSlicePlane);

    let sagittal_cam = sagittal_renderer.getActiveCamera();
    sagittal_cam.setParallelProjection(true);
    sagittal_cam.setPosition(0, 0, 0);
    sagittal_cam.setFocalPoint(1, 0, 0);
    sagittal_cam.setViewUp(0, 0, 1);

    sagittal_mapper.setInputData(imageData);

    sSlicePlane.setOrigin(0.5 * (bds[0] + bds[1]), 0.5 * (bds[2] + bds[3]), bds[4]);

    sagittal_renderer.resetCamera();
    sagittal_cam.setParallelScale(sagittal_cam.getParallelScale() * 0.75); // zooming
    // ------------------------------------------
    // ------- END: SAGITTAL CONTAINER SETUP -------
    // ------------------------------------------
    // ------------------------------------------
    // ------- BEGIN: AXIAL/TRANSVERSE CONTAINER SETUP ---
    // ------------------------------------------    
    const axial_container = axialContainerRef.current;
    
    axial_container.style.position = 'absolute';
    axial_container.style.width = `${width}px`;
    axial_container.style.height = `${height}px`;
    axial_container.style.bottom = '0px'
    axial_container.style.border = '3px solid #A39992';
    axial_container.style.display = 'flex';
    axial_container.style.justifyContent = 'flex-end';
    axial_container.style.left = `${vol_cont_rect.x + vol_cont_rect.width}px`;
    
    axial_container.addEventListener('pointerenter', () =>
      bindInteractor(interactor, axial_container)
    );
    axial_container.addEventListener('pointerleave', () =>
      bindInteractor(interactor, null)
    );

    const axial_actor = vtkImageSlice.newInstance();
    const axial_mapper = vtkImageResliceMapper.newInstance();
    axial_actor.setMapper(axial_mapper);
    axial_renderer.addActor(axial_actor);

    axial_actor.getProperty().setColorWindow(255);
    axial_actor.getProperty().setColorLevel(100);

    const aSlicePlane = vtkPlane.newInstance();
    aSlicePlane.setNormal(0, 0, 1);
    axial_mapper.setSlicePlane(aSlicePlane);

    let axial_cam = axial_renderer.getActiveCamera();
    axial_cam.setParallelProjection(true);
    axial_cam.setPosition(0, 0, 0);
    axial_cam.setFocalPoint(0, 0, 1);
    axial_cam.setViewUp(0, -1, 0);

    
    axial_mapper.setInputData(imageData);
    
    aSlicePlane.setOrigin(0.5 * (bds[0] + bds[1]), 0.5 * (bds[2] + bds[3]), 0.5 * (bds[4] + bds[5]));
    
    axial_renderer.resetCamera();
    axial_cam.setParallelScale(axial_cam.getParallelScale() * 0.75); // zooming
    // ------------------------------------------
    // ------- END: AXIAL/TRANSVERSE CONTAINER SETUP ---
    // ------------------------------------------

    renderWindow.render();
  };

  useEffect(() => {
    if (rootContainerRef.current && imageData) {
      setupRenderers();
    }
  }, [])


  return (
    <Box sx={{height: '100%'}} ref={rootContainerRef}>
      <Box xs={6}  id="0"
        ref={volumeContainerRef} />
      <Box xs={6}  id="1"
        ref={coronalContainerRef} />
      <Box xs={6}  id="2"
        ref={sagittalContainerRef} />
      <Box xs={6}  id="3"
        ref={axialContainerRef} />
    </Box>
  )
}
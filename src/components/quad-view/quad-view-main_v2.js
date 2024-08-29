import React, { useEffect, useRef } from 'react';
import vtkRenderWindow from '@kitware/vtk.js/Rendering/Misc/RenderWindow';
import vtkRenderer from '@kitware/vtk.js/Rendering/Core/Renderer';
import vtkRenderWindowInteractor from '@kitware/vtk.js/Rendering/Core/RenderWindowInteractor';
import vtkInteractorStyleTrackballCamera from '@kitware/vtk.js/Interaction/Style/InteractorStyleTrackballCamera';
// import additional vtk.js components as needed

export default function QuadView({ dicomFiles }) {
  const vtkContainerRef = useRef(null);

  useEffect(() => {
    if (dicomFiles.length > 0) {
      setupQuadView();
    }
  }, [dicomFiles]);

  const setupQuadView = () => {
    // Create render window and renderer
    const renderWindow = vtkRenderWindow.newInstance();
    const renderer = vtkRenderer.newInstance();
    renderWindow.addRenderer(renderer);

    // Set up render window interactor
    const interactor = vtkRenderWindowInteractor.newInstance();
    interactor.setView(renderWindow);
    interactor.initialize();
    interactor.bindEvents(vtkContainerRef.current);

    const interactorStyle = vtkInteractorStyleTrackballCamera.newInstance();
    interactor.setInteractorStyle(interactorStyle);

    // Check that dicomFiles are valid and not empty
    if (dicomFiles && dicomFiles.length > 0) {
      dicomFiles.forEach((file) => {
        if (file && file.size > 0) {
          // Process each DICOM file with vtk.js
          // Add your DICOM loading and rendering logic here
          // E.g., use vtk.js readers to read the DICOM file and render
        }
      });
    } else {
      console.error('No valid DICOM files provided.');
    }

    // Add the renderer to the DOM
    const vtkContainer = vtkContainerRef.current;
    vtkContainer.appendChild(renderWindow.getInteractor().getCanvas());
    renderer.resetCamera();
    renderWindow.render();
  };

  return <div ref={vtkContainerRef} style={{ width: '100%', height: '100%' }} />;
}

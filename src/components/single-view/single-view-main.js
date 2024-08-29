
import { useState, useRef, useEffect } from 'react';

import '@kitware/vtk.js/Rendering/Profiles/Geometry';

import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';
import vtkRenderWindowWithControlBar from '@kitware/vtk.js/Rendering/Misc/RenderWindowWithControlBar';
import vtkActor from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkConeSource from '@kitware/vtk.js/Filters/Sources/ConeSource';
import { Box, Container } from '@mui/material';
import vtkGenericRenderWindow from '@kitware/vtk.js/Rendering/Misc/GenericRenderWindow';
import vtkOutlineFilter from '@kitware/vtk.js/Filters/General/OutlineFilter';

export default function SingleView() {

    const vtkContainerRef = useRef(null);
    const context = useRef(null);

    useEffect(() => {
        const createRenderWindow = () => {
            // Create render window inside container
            const renderWindow = vtkRenderWindowWithControlBar.newInstance({
                controlSize: 25,
            });
            //const renderWindow = vtkGenericRenderWindow.newInstance();
            renderWindow.setContainer(vtkContainerRef.current);

            // Add some content to the renderer
            const coneSource = vtkConeSource.newInstance();

            const filter = vtkOutlineFilter.newInstance();
            filter.setInputConnection(coneSource.getOutputPort());
            const outlineActor = vtkActor.newInstance();
            const outlineMapper = vtkMapper.newInstance();
            outlineActor.setMapper(outlineMapper);
            outlineMapper.setInputConnection(filter.getOutputPort());

            const mapper = vtkMapper.newInstance();
            const actor = vtkActor.newInstance();

            mapper.setInputConnection(coneSource.getOutputPort());
            actor.setMapper(mapper);

            renderWindow.getRenderer().addActor(actor);
            renderWindow.getRenderer().addActor(outlineActor);

            renderWindow.getRenderer().resetCamera();
            renderWindow.getRenderWindow().render();

        }
        if (vtkContainerRef.current) {
            createRenderWindow();
        }
    }, []);


    return (
        <Container maxWidth="xl">
            <Box ref={vtkContainerRef} sx={{ width: '100%', height: '800px' }}/>
        </Container>
    );

}
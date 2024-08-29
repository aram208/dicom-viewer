import { useState } from 'react';

import { Button, Container } from '@mui/material';

export default function DICOMReader({dicomFiles, setDicomFiles}) {


    const handleFileChange = (event) => {
        const files = Array.from(event.target.files);
        setDicomFiles(files);
      };

    return (
        <Container>
            <input
                accept=".dcm"
                style={{ display: 'none' }}
                id="dicom-file-input"
                type="file"
                multiple
                onChange={handleFileChange}
            />
            <label htmlFor="dicom-file-input">
                <Button variant="contained" color="primary" component="span">
                    Upload DICOM Files
                </Button>
            </label>
        </Container>
    )
}
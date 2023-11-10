import React, { useState, useCallback, useMemo } from 'react';
import axios from 'axios';
import {
    Container, TextField, Button, Typography, Box, Card, CardContent, Divider,
    List, ListItem, Grid, CircularProgress, Snackbar, IconButton, CssBaseline
} from '@mui/material';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import Brightness4Icon from '@mui/icons-material/Brightness4';

const SearchBar = ({ companyName, setCompanyName, fetchData, loading, toggleDarkMode }) => (
    <Grid container spacing={2} justifyContent="center" alignItems="center">
        <Grid item xs={8} sm={6}>
            <TextField
                fullWidth
                variant="outlined"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                placeholder="Search for a company..."
            />
        </Grid>
        <Grid item xs={8} sm={2}>
            <Button
                fullWidth
                variant="contained"
                color="primary"
                onClick={fetchData}
                disabled={loading}
            >
                Search
            </Button>
        </Grid>
        <Grid item xs={4} sm={2}>
            <IconButton color="inherit" onClick={toggleDarkMode} aria-label="Toggle Dark Mode">
                <Brightness4Icon />
            </IconButton>
        </Grid>
    </Grid>
);

const SearchHistory = ({ searchHistory, displaySearchHistory }) => (
    <Grid item xs={12} sm={4} md={3} lg={2} style={{ borderRight: '1px solid rgba(0, 0, 0, 0.12)' }}>
        <Typography variant="h5" gutterBottom>Search History</Typography>
        <Divider />
        <List>
            {searchHistory.length === 0 ? (
                <Typography variant="subtitle1">No search history</Typography>
            ) : (
                searchHistory.map((historyItem, idx) => (
                    <ListItem button key={idx} onClick={() => displaySearchHistory(historyItem)}>
                        <Typography variant="subtitle1">{historyItem.companyName}</Typography>
                    </ListItem>
                ))
            )}
        </List>
    </Grid>
);

function App() {
    const [companyName, setCompanyName] = useState('');
    const [results, setResults] = useState({});
    const [searchHistory, setSearchHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [darkMode, setDarkMode] = useState(false);

    const theme = useMemo(() => createTheme({
        palette: {
            mode: darkMode ? 'dark' : 'light',
        },
    }), [darkMode]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await axios.post('http://localhost:8000/search_company/', { company_name: companyName });
            setResults(response.data);
            setSearchHistory(prev => [{ companyName, results: response.data }, ...prev]);
        } catch (err) {
            setError("Failed fetching data. Please try again.");
        } finally {
            setLoading(false);
        }
    }, [companyName]);

    const displaySearchHistory = useCallback((historyItem) => {
        setResults(historyItem.results);
    }, []);

    const toggleDarkMode = useCallback(() => {
        setDarkMode(prev => !prev);
    }, []);

    const handleCloseSnackbar = useCallback(() => {
        setError('');
    }, []);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth={false}>
                <Box sx={{ mt: 8, mb: 4, display: 'flex' }}>
                    <Grid container spacing={3}>
                        <SearchHistory searchHistory={searchHistory} displaySearchHistory={displaySearchHistory} />
                        <Grid item xs={12} sm={8} md={9} lg={10}>
                            <Typography variant="h2" align="center" gutterBottom>
                                AI Company Searcher
                            </Typography>
                            <SearchBar
                                companyName={companyName}
                                setCompanyName={setCompanyName}
                                fetchData={fetchData}
                                loading={loading}
                                toggleDarkMode={toggleDarkMode}
                            />
                            {loading && <CircularProgress />}
                            {Object.entries(results).map(([key, value]) => (
                                <Card key={key} variant="outlined" style={{ marginTop: '16px' }}>
                                    <CardContent>
                                        <Typography variant="h6" gutterBottom>{key}</Typography>
                                        <Typography>{value}</Typography>
                                    </CardContent>
                                </Card>
                            ))}
                            <Snackbar
                                open={Boolean(error)}
                                autoHideDuration={6000}
                                onClose={handleCloseSnackbar}
                                message={error}
                                action={
                                    <IconButton size="small" color="inherit" onClick={handleCloseSnackbar}>
                                        x
                                    </IconButton>
                                }
                            />
                        </Grid>
                    </Grid>
                </Box>
            </Container>
        </ThemeProvider>
    );
}

export default App;

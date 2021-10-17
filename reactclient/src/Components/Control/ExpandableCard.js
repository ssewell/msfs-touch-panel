import React, { useState } from 'react';
import makeStyles from '@mui/styles/makeStyles';
import { Typography } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const useStyles = makeStyles((theme) => ({
    root: theme.custom.defaultRoot,
    expandIconClose: {
        marginLeft: 'auto'
    },
    expandIconOpen: {
        marginLeft: 'auto',
        transform: 'rotate(180deg)'
    },
    gridExpandIcon: {
        display: 'flex',
        justifyContent: 'flex-end'
    },
    gridTitle: {
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center'
    }
}));

const ExpandableCard = ({ title, children }) => {
    const classes = useStyles();
    const [expanded, setExpanded] = useState(true);

    return (
        <Card className={classes.root}>
            <CardActions disableSpacing onClick={() => setExpanded(!expanded)}>
                <Grid container>
                    <Grid item xs={11} className={classes.gridTitle}>
                        <Typography variant='body1'>{title}</Typography>
                    </Grid>
                    <Grid item xs={1} className={classes.gridExpandIcon}>
                        <IconButton
                            className={ expanded ? classes.expandIconOpen : classes.expandIconClose }
                            aria-expanded={expanded}
                            aria-label="expand"
                            size="large">
                            <ExpandMoreIcon />
                        </IconButton>
                    </Grid>
                </Grid>
            </CardActions>
            <Collapse in={expanded} timeout={0} unmountOnExit>
                <CardContent>
                    {children}
                </CardContent>
            </Collapse>
        </Card>
    );
}

ExpandableCard.defaultProps = {
    title: ''
};

export default ExpandableCard;
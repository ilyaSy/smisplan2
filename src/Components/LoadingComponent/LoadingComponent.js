import CircularProgress from '@material-ui/core/CircularProgress';

export default function LoadingComponent() {
  return (
    <div style={{ textAlign: 'center', paddingTop: '200px' }}>
      <CircularProgress style={{ width: '100px', height: '100px' }} />;
    </div>
  );
}

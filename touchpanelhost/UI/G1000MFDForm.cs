using System.Windows.Forms;

namespace MSFSTouchPanel.TouchPanelHost.UI
{
    public partial class G1000MFDForm: Form
    {
        public G1000MFDForm()
        {
            InitializeComponent();

            // Keep form always on top across all active windows
            WindowManager.AlwaysOnTop(this.Handle);
        }
    }
}

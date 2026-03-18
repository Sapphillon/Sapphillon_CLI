mod commands;
mod utils;

use clap::{Parser, Subcommand};
use commands::{build, init};

#[derive(Parser)]
#[command(name = "sapphillon")]
#[command(version = "0.1.0")]
#[command(about = "A command-line tool for creating and building Sapphillon plugin packages.")]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Initialize a new plugin package
    Init {
        /// Name of the plugin
        name: Option<String>,

        /// Name to use
        #[arg(short, long)]
        name_opt: Option<String>,

        /// Target directory (default: plugin name)
        #[arg(short, long)]
        directory: Option<String>,

        /// Package ID (default: com.example)
        #[arg(long)]
        package_id: Option<String>,

        /// Package description
        #[arg(long)]
        description: Option<String>,

        /// Language for init command: 'javascript' (js) or 'typescript' (ts), default: javascript
        #[arg(long)]
        language: Option<String>,
    },

    /// Build a plugin package
    Build {
        /// Project directory (default: current directory)
        #[arg(short, long)]
        project: Option<String>,

        /// Output directory (default: same as project)
        #[arg(short, long)]
        output: Option<String>,
    },
}

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    let cli = Cli::parse();

    match cli.command {
        Commands::Init {
            name,
            name_opt,
            directory,
            package_id,
            description,
            language,
        } => {
            let plugin_name = name_opt.or(name).ok_or_else(|| {
                anyhow::anyhow!("Error: Plugin name is required\nUsage: sapphillon init <plugin-name> [OPTIONS]\n   or: sapphillon init --name <plugin-name> [OPTIONS]")
            })?;

            init::exec(init::InitOptions {
                name: plugin_name,
                directory,
                package_id,
                description,
                language,
            })
            .await?;
        }
        Commands::Build { project, output } => {
            build::exec(build::BuildOptions { project, output }).await?;
        }
    }

    Ok(())
}

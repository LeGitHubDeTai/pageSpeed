# PageSpeed Project

This project is a Node.js script that fetches PageSpeed Insights data for a list of URLs from a sitemap. It uses the Google PageSpeed Insights API to retrieve performance metrics and save the results in JSON format. The script is designed to be used in a GitHub Action workflow, but it can also be run locally.

## Getting Started

### Prerequisites

Before you can run this script, make sure you have the following prerequisites:

1. Node.js installed on your machine.

### Installation

1. Clone this repository to your local machine:

```shell
   git clone https://github.com/LeGitHubDeTai/pageSpeed.git
```

2. Install the required dependencies using npm:

```shell
    npm install
```

### Usage

To run the script locally, use the following command:

```shell
    npm start -- --site="https://taistudio.fr/" --device="desktop"
```

The script will fetch PageSpeed Insights data for all the URLs in the sitemap and store the results in the data directory.
The script will also create subdirectories for each URL and save the results as JSON files.

### License
This project is licensed under the MIT License - see the LICENSE file for details.

### Acknowledgments
This project uses the axios library to make HTTP requests.
It also uses xml2js to parse XML sitemaps.
Feel free to contribute to this project or open issues if you encounter any problems. Happy performance testing!


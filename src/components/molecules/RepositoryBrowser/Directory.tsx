import range from "lodash/range"
import path from "path"
import React from "react"
import lifecycle from "recompose/lifecycle"
import { FileInfo, Repository } from "../../../lib/repository"
import { AddFile } from "./AddFile"
import { File } from "./File"
import { FileListLoader } from "./FileListLoader"

type Props = {
  dPath: string
  depth: number
  repo: Repository
  open?: boolean
}

export class Directory extends React.Component<Props, { opened: boolean }> {
  constructor(props: Props) {
    super(props)
    this.state = { opened: this.props.open || false }
  }
  render() {
    const { dPath, repo, depth } = this.props
    const { opened } = this.state

    const relPath = path.relative(repo.dir, dPath)
    const basename = path.basename(relPath)
    const prefix = range(depth)
      .map(_ => "◽")
      .join("")
    const prefixPlusOne = range(depth + 1)
      .map(_ => "◽")
      .join("")

    return (
      <div>
        <div>
          {prefix}
          <button
            onClick={() => {
              this.setState({ opened: !this.state.opened })
            }}
          >
            {opened ? "-" : "+"}
          </button>
          &nbsp;
          {basename || `${dPath}`}
        </div>
        {opened && (
          <>
            <div>
              {prefixPlusOne}
              <AddFile parentDir={dPath} />
            </div>
            <FileListLoader aPath={path.join(repo.dir, relPath)}>
              {({
                data,
                loading
              }: {
                loading: boolean
                data: { fileList: FileInfo[] } | null
              }) => {
                if (loading) {
                  return null
                } else if (data != null) {
                  return (
                    <DirectoryFileList
                      fileList={data.fileList}
                      depth={depth}
                      dPath={dPath}
                      repo={repo}
                    />
                  )
                }
              }}
            </FileListLoader>
          </>
        )}
      </div>
    )
  }
}

function DirectoryFileList({
  fileList,
  depth,
  dPath,
  repo
}: {
  fileList: FileInfo[]
  dPath: string
  depth: number
  repo: Repository
}) {
  return (
    <>
      {fileList.map((f: FileInfo) => {
        const filepath = path.join(dPath, f.name)
        return (
          <div key={f.name}>
            {f.type === "file" && (
              <File depth={depth + 1} filepath={filepath} />
            )}
            {f.type === "dir" && (
              <Directory
                dPath={path.join(dPath, f.name)}
                depth={depth + 1}
                repo={repo}
              />
            )}
          </div>
        )
      })}
    </>
  )
}

export const RootDirectory: React.ComponentType<Props> = lifecycle({
  // async componentDidMount() {}
})(Directory)
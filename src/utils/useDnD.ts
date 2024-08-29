import { useEffect } from 'react'
import { DropZoneTarget, isDropZoneTarget } from '../editor-components/DropZone'
import {
  ComponentItemSource,
  isComponentItemSource,
} from '../editor-components/ComponentItem'
import {
  isCanvasItemSource,
  isCanvasItemTarget,
  type CanvasItemSource,
  type CanvasItemTarget,
} from '../editor-components/CanvasItem'
import { isBlock, isExperience, type Experience, type Block } from '../db'
import {
  Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge'
import { useMutation } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import { reorderWithEdge } from '@atlaskit/pragmatic-drag-and-drop-hitbox/util/reorder-with-edge'

export function useDnD() {
  const context = useRouteContext({ from: '/experiences/$id' })

  // Move a canvasItem from a block to a canvasItem in a different block
  const moveBlockItemToOtherBlockItem = useMutation({
    mutationFn: (args: {
      source: CanvasItemSource
      target: CanvasItemTarget
      sourceParentNode: Block
      targetParentNode: Block
      edge: Edge | null
    }) => {
      const clonedSourceParentNode = structuredClone(args.sourceParentNode)
      const clonedTargetParentNode = structuredClone(args.targetParentNode)

      clonedSourceParentNode.blocks[args.source.parent.slotKey] =
        args.source.parent.node.blocks[args.source.parent.slotKey].filter(
          (b) => b !== args.source.block.id,
        )

      clonedTargetParentNode.blocks[args.target.parent.slotKey].splice(
        args.edge === 'top' ? args.target.index : args.target.index + 1,
        0,
        args.source.block.id,
      )

      return Promise.all([
        context.updateBlock({ block: clonedSourceParentNode }),
        context.updateBlock({ block: clonedTargetParentNode }),
      ])
    },
    onSuccess: ([sourceId, targetId]) => {
      context.queryClient.invalidateQueries({
        queryKey: ['blocks', sourceId],
      })
      context.queryClient.invalidateQueries({
        queryKey: ['blocks', targetId],
      })
    },
  })

  // Move a canvasItem from a block to a canvasItem the same block
  const moveBlockItemToSameBlockItem = useMutation({
    mutationFn: (args: {
      source: CanvasItemSource
      target: CanvasItemSource
      targetParentNode: Block
      edge: Edge | null
    }) => {
      const clonedTargetParentNode = structuredClone(args.targetParentNode)

      clonedTargetParentNode.blocks[args.source.parent.slotKey] =
        args.source.parent.node.blocks[args.source.parent.slotKey].filter(
          (b) => b !== args.source.block.id,
        )

      clonedTargetParentNode.blocks[args.target.parent.slotKey].splice(
        args.edge === 'top' ? args.target.index : args.target.index + 1,
        0,
        args.source.block.id,
      )

      return context.updateBlock({ block: clonedTargetParentNode })
    },
    onSuccess: (targetId) => {
      context.queryClient.invalidateQueries({
        queryKey: ['blocks', targetId],
      })
    },
  })

  // Move a canvasItem from a block to a canvasItem in an experience
  const moveBlockItemToExperienceItem = useMutation({
    mutationFn: (args: {
      source: CanvasItemSource
      target: CanvasItemTarget
      sourceParentNode: Block
      targetParentNode: Experience
      edge: Edge | null
    }) => {
      const clonedSourceParentNode = structuredClone(args.sourceParentNode)
      const clonedTargetParentNode = structuredClone(args.targetParentNode)

      clonedSourceParentNode.blocks[args.source.parent.slotKey] =
        args.source.parent.node.blocks[args.source.parent.slotKey].filter(
          (b) => b !== args.source.block.id,
        )

      clonedTargetParentNode.blocks[args.target.parent.slotKey].splice(
        args.edge === 'top' ? args.target.index : args.target.index + 1,
        0,
        args.source.block.id,
      )

      return Promise.all([
        context.updateBlock({ block: clonedSourceParentNode }),
        context.updateExperience({ experience: clonedTargetParentNode }),
      ])
    },
    onSuccess: ([sourceId, targetId]) => {
      context.queryClient.invalidateQueries({
        queryKey: ['blocks', sourceId],
      })
      context.queryClient.invalidateQueries({
        queryKey: ['experiences', targetId],
      })
    },
  })

  // Move a canvasItem from an experience to a canvasItem in an experience
  const moveExperienceItemToExperienceItem = useMutation({
    mutationFn: (args: {
      source: CanvasItemSource
      target: CanvasItemSource
      targetParentNode: Experience
      edge: Edge | null
    }) => {
      const clonedTargetParentNode = structuredClone(args.targetParentNode)

      clonedTargetParentNode.blocks[args.target.parent.slotKey] =
        reorderWithEdge({
          list: args.target.parent.node.blocks[args.target.parent.slotKey],
          startIndex: args.source.index,
          indexOfTarget: args.target.index,
          closestEdgeOfTarget: args.edge,
          axis: 'vertical',
        })
      return context.updateExperience({ experience: clonedTargetParentNode })
    },
    onSuccess: (targetId) => {
      context.queryClient.invalidateQueries({
        queryKey: ['experiences', targetId],
      })
    },
  })

  // Move a canvasItem from an experience to a block canvasItem
  const moveExperienceItemToBlockItem = useMutation({
    mutationFn: (args: {
      source: CanvasItemSource
      target: CanvasItemTarget
      sourceParentNode: Experience
      targetParentNode: Block
      edge: Edge | null
    }) => {
      const clonedSourceParentNode = structuredClone(args.sourceParentNode)
      const clonedTargetParentNode = structuredClone(args.targetParentNode)

      clonedSourceParentNode.blocks[args.source.parent.slotKey] =
        args.source.parent.node.blocks[args.source.parent.slotKey].filter(
          (b) => b !== args.source.block.id,
        )

      clonedTargetParentNode.blocks[args.target.parent.slotKey].splice(
        args.edge === 'top' ? args.target.index : args.target.index + 1,
        0,
        args.source.block.id,
      )
      return Promise.all([
        context.updateExperience({ experience: clonedSourceParentNode }),
        context.updateBlock({ block: clonedTargetParentNode }),
      ])
    },
    onSuccess: ([sourceId, targetId]) => {
      context.queryClient.invalidateQueries({
        queryKey: ['experiences', sourceId],
      })
      context.queryClient.invalidateQueries({
        queryKey: ['blocks', targetId],
      })
    },
  })

  // Move a canvasItem from an experience to a block dropzone
  const moveExperienceItemToBlockDropZone = useMutation({
    mutationFn: (args: {
      source: CanvasItemSource
      target: DropZoneTarget
      sourceParentNode: Experience
      targetParentNode: Block
    }) => {
      const clonedSourceParentNode = structuredClone(args.sourceParentNode)
      const clonedTargetParentNode = structuredClone(args.targetParentNode)

      clonedSourceParentNode.blocks[args.source.parent.slotKey] =
        args.source.parent.node.blocks[args.source.parent.slotKey].filter(
          (b) => b !== args.source.block.id,
        )

      clonedTargetParentNode.blocks[args.target.parent.slotKey] = [
        args.source.block.id,
      ]

      return Promise.all([
        context.updateExperience({ experience: clonedSourceParentNode }),
        context.updateBlock({ block: clonedTargetParentNode }),
      ])
    },
    onSuccess: ([sourceId, targetId]) => {
      context.queryClient.invalidateQueries({
        queryKey: ['experiences', sourceId],
      })
      context.queryClient.invalidateQueries({
        queryKey: ['blocks', targetId],
      })
    },
  })

  // Move a canvasItem from a block to a dropzone in a different block
  const moveBlockItemToOtherBlockDropZone = useMutation({
    mutationFn: (args: {
      source: CanvasItemSource
      target: DropZoneTarget
      targetParentNode: Block
      sourceParentNode: Block
    }) => {
      const clonedTargetParentNode = structuredClone(args.targetParentNode)
      const clonedSourceParentNode = structuredClone(args.sourceParentNode)

      clonedSourceParentNode.blocks[args.source.parent.slotKey] =
        args.source.parent.node.blocks[args.source.parent.slotKey].filter(
          (b) => b !== args.source.block.id,
        )

      clonedTargetParentNode.blocks[args.target.parent.slotKey] = [
        args.source.block.id,
      ]

      return Promise.all([
        context.updateBlock({ block: clonedSourceParentNode }),
        context.updateBlock({ block: clonedTargetParentNode }),
      ])
    },
    onSuccess: ([sourceId, targetId]) => {
      context.queryClient.invalidateQueries({
        queryKey: ['blocks', sourceId],
      })
      context.queryClient.invalidateQueries({
        queryKey: ['blocks', targetId],
      })
    },
  })

  // Move a canvasItem from a block to a dropzone in the same block
  const moveBlockItemtoSameBlockDropZone = useMutation({
    mutationFn: (args: {
      source: CanvasItemSource
      target: DropZoneTarget
      targetParentNode: Block
    }) => {
      if (!isBlock(args.target.parent.node)) throw new Error('no op')

      const clonedTargetParentNode = structuredClone(args.targetParentNode)

      clonedTargetParentNode.blocks[args.target.parent.slotKey] = [
        args.source.block.id,
      ]

      clonedTargetParentNode.blocks[args.source.parent.slotKey] =
        args.source.parent.node.blocks[args.source.parent.slotKey].filter(
          (b) => b !== args.source.block.id,
        )

      return context.updateBlock({ block: clonedTargetParentNode })
    },
    onSuccess: (updatedId) => {
      context.queryClient.invalidateQueries({
        queryKey: ['blocks', updatedId],
      })
    },
  })

  const addComponentItemToDropZone = useMutation({
    mutationFn: async (args: {
      source: ComponentItemSource
      target: DropZoneTarget
    }) => {
      const configItem = context.config[args.source.type]
      const propKeys = Object.keys(configItem.props)
      const blockKeys = Object.keys(configItem.blocks)

      const defaultProps = propKeys.reduce((props, propKey) => {
        return { ...props, [propKey]: configItem.props[propKey].default }
      }, {})

      const defaultBlocks = blockKeys.reduce((blocks, blockKey) => {
        return { ...blocks, [blockKey]: configItem.blocks[blockKey].default }
      }, {})

      const blockId = await context.addBlock({
        type: args.source.type,
        name: configItem.name,
        props: defaultProps,
        blocks: defaultBlocks,
      })

      const clonedTargetParentNode = structuredClone(args.target.parent.node)
      clonedTargetParentNode.blocks[args.target.parent.slotKey] = [blockId]

      if (isExperience(clonedTargetParentNode)) {
        return context.updateExperience({ experience: clonedTargetParentNode })
      } else if (isBlock(clonedTargetParentNode)) {
        return context.updateBlock({ block: clonedTargetParentNode })
      } else {
        throw new Error('no op')
      }
    },
    onSuccess: (updatedId, vars) => {
      if (isExperience(vars.target.parent.node)) {
        context.queryClient.invalidateQueries({
          queryKey: ['experiences', updatedId],
        })
      }
      if (isBlock(vars.target.parent.node)) {
        context.queryClient.invalidateQueries({
          queryKey: ['blocks', updatedId],
        })
      }
    },
  })

  const addComponentItemToBlockItem = useMutation({
    mutationFn: async (args: {
      source: ComponentItemSource
      target: CanvasItemTarget
      edge: Edge | null
    }) => {
      const configItem = context.config[args.source.type]
      const propKeys = Object.keys(configItem.props)
      const blockKeys = Object.keys(configItem.blocks)

      const defaultProps = propKeys.reduce((props, propKey) => {
        return { ...props, [propKey]: configItem.props[propKey].default }
      }, {})

      const defaultBlocks = blockKeys.reduce((blocks, blockKey) => {
        return { ...blocks, [blockKey]: configItem.blocks[blockKey].default }
      }, {})

      const blockId = await context.addBlock({
        type: args.source.type,
        name: configItem.name,
        props: defaultProps,
        blocks: defaultBlocks,
      })

      const clonedTargetParentNode = structuredClone(args.target.parent.node)
      clonedTargetParentNode.blocks[args.target.parent.slotKey].splice(
        args.edge === 'top' ? args.target.index : args.target.index + 1,
        0,
        blockId,
      )

      if (isExperience(clonedTargetParentNode)) {
        return context.updateExperience({ experience: clonedTargetParentNode })
      } else if (isBlock(clonedTargetParentNode)) {
        return context.updateBlock({ block: clonedTargetParentNode })
      } else {
        throw new Error('no op')
      }
    },
    onSuccess: (updatedId, vars) => {
      if (isExperience(vars.target.parent.node)) {
        context.queryClient.invalidateQueries({
          queryKey: ['experiences', updatedId],
        })
      }
      if (isBlock(vars.target.parent.node)) {
        context.queryClient.invalidateQueries({
          queryKey: ['blocks', updatedId],
        })
      }
    },
  })

  useEffect(() => {
    return monitorForElements({
      onDrop: async ({ source, location }) => {
        const target = location.current.dropTargets[0]

        if (isDropZoneTarget(target.data)) {
          if (isComponentItemSource(source.data)) {
            addComponentItemToDropZone.mutate({
              target: target.data,
              source: source.data,
            })
          }
          if (isCanvasItemSource(source.data)) {
            if (isBlock(source.data.parent.node)) {
              if (isBlock(target.data.parent.node)) {
                if (source.data.parent.node.id === target.data.parent.node.id) {
                  // Move a canvasItem from a block to a dropzone in the same block
                  moveBlockItemtoSameBlockDropZone.mutate({
                    source: source.data,
                    target: target.data,
                    targetParentNode: target.data.parent.node,
                  })
                } else {
                  // Move a canvasItem from a block to a dropzone in a different block
                  moveBlockItemToOtherBlockDropZone.mutate({
                    source: source.data,
                    target: target.data,
                    targetParentNode: target.data.parent.node,
                    sourceParentNode: source.data.parent.node,
                  })
                }
              }
            }

            if (isExperience(source.data.parent.node)) {
              if (isBlock(target.data.parent.node)) {
                // Move a canvasItem from an experience to a block dropzone
                moveExperienceItemToBlockDropZone.mutate({
                  source: source.data,
                  target: target.data,
                  targetParentNode: target.data.parent.node,
                  sourceParentNode: source.data.parent.node,
                })
              }
            }
          }
        }
        if (isCanvasItemTarget(target.data)) {
          const closestEdge = extractClosestEdge(target.data)
          if (isComponentItemSource(source.data)) {
            addComponentItemToBlockItem.mutate({
              source: source.data,
              target: target.data,
              edge: closestEdge,
            })
          }
          if (isCanvasItemSource(source.data)) {
            if (isExperience(source.data.parent.node)) {
              if (isBlock(target.data.parent.node)) {
                // Move a canvasItem from an experience to a block canvasItem
                moveExperienceItemToBlockItem.mutate({
                  source: source.data,
                  target: target.data,
                  sourceParentNode: source.data.parent.node,
                  targetParentNode: target.data.parent.node,
                  edge: closestEdge,
                })
              }
              if (isExperience(target.data.parent.node)) {
                // Move a canvasItem from an experience to a canvasItem in an experience
                moveExperienceItemToExperienceItem.mutate({
                  source: source.data,
                  target: target.data,
                  targetParentNode: target.data.parent.node,
                  edge: closestEdge,
                })
              }
            }

            if (isBlock(source.data.parent.node)) {
              if (isExperience(target.data.parent.node)) {
                // Move a canvasItem from a block to a canvasItem in an experience
                moveBlockItemToExperienceItem.mutate({
                  source: source.data,
                  target: target.data,
                  targetParentNode: target.data.parent.node,
                  sourceParentNode: source.data.parent.node,
                  edge: closestEdge,
                })
              }
              if (isBlock(target.data.parent.node)) {
                if (target.data.parent.node.id === source.data.parent.node.id) {
                  // Move a canvasItem from a block to a canvasItem the same block
                  moveBlockItemToSameBlockItem.mutate({
                    source: source.data,
                    target: target.data,
                    targetParentNode: target.data.parent.node,
                    edge: closestEdge,
                  })
                } else {
                  moveBlockItemToOtherBlockItem.mutate({
                    source: source.data,
                    target: target.data,
                    sourceParentNode: source.data.parent.node,
                    targetParentNode: target.data.parent.node,
                    edge: closestEdge,
                  })
                }
              }
            }
          }
        }
      },
    })
  }, [])

  const pending =
    moveExperienceItemToExperienceItem.isPending ||
    moveExperienceItemToBlockDropZone.isPending ||
    moveBlockItemToOtherBlockDropZone.isPending ||
    moveBlockItemtoSameBlockDropZone.isPending ||
    moveBlockItemToOtherBlockItem.isPending ||
    moveExperienceItemToBlockItem.isPending ||
    moveBlockItemToExperienceItem.isPending ||
    moveBlockItemToSameBlockItem.isPending ||
    addComponentItemToBlockItem.isPending ||
    addComponentItemToDropZone.isPending

  return { pending }
}
